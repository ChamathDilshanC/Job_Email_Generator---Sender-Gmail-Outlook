import { Readable } from "node:stream";
import { google, type drive_v3 } from "googleapis";

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  thumbnailLink?: string;
}

export interface DrivePdf {
  buffer: Buffer;
  name: string;
  mimeType: string;
  modifiedTime?: string;
}

// Same set resume-core's sync accepts — keep in sync with
// resume-core/scripts/lib/google-drive.js's SUPPORTED_MIME_TYPES.
const SUPPORTED_MIME_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

// Service-account client: used for everything that doesn't create new file
// content (listing, rename, trash) — none of that needs storage quota, so
// the service account (which has none of its own) handles it fine.
function getServiceAccountDriveClient(): drive_v3.Drive {
  const credentialsJson = process.env.GDRIVE_CREDENTIALS;
  if (!credentialsJson) {
    throw new Error("GDRIVE_CREDENTIALS is not configured on resume-admin.");
  }
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(credentialsJson),
    // Broad "drive" scope (not drive.file) for the same reason resume-core
    // uses it: files/folders here were shared with the service account via
    // the ordinary Drive "Share" dialog, not created by this app, and
    // drive.file only ever sees files the app itself created/opened.
    scopes: ["https://www.googleapis.com/auth/drive"],
  });
  return google.drive({ version: "v3", auth });
}/**
 * Downloads the stable, in-place-updated resume PDF. The service account is
 * used so this endpoint never needs to receive or return a user's OAuth token.
 */
export async function downloadResumePdf(fileId: string): Promise<DrivePdf> {
  const drive = getServiceAccountDriveClient();
  const metadata = await drive.files.get({
    fileId,
    fields: "id,name,mimeType,modifiedTime,trashed",
  });
  const file = metadata.data;
  if (!file.id || !file.name || file.trashed || file.mimeType !== "application/pdf") {
    throw new Error("Configured resume Drive file is unavailable or is not a PDF.");
  }

  const media = await drive.files.get(
    { fileId, alt: "media" },
    { responseType: "arraybuffer" }
  );
  const data = media.data as ArrayBuffer | Buffer;
  return {
    buffer: Buffer.isBuffer(data) ? data : Buffer.from(data),
    name: file.name,
    mimeType: file.mimeType,
    modifiedTime: file.modifiedTime ?? undefined,
  };
}

// User-OAuth client: the only one that can create new file *content*. A
// service account has zero storage quota on a normal (non-Workspace)
// account and 403s on files.create — uploads have to run as the real
// account owner instead, using the access token from their linked Google
// sign-in (see lib/auth.ts's Google provider).
function getUserDriveClient(accessToken: string): drive_v3.Drive {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.drive({ version: "v3", auth });
}// Live, on-demand listing — no sync step, no wait. Used by the Project
// Drive gallery so a file dropped into Drive shows up the moment the page
// is opened/refreshed, instead of only after resume-core's background sync
// workflow has run and committed resume.json.
export async function listFolderImages(folderId: string): Promise<DriveFile[]> {
  const drive = getServiceAccountDriveClient();
  const files: DriveFile[] = [];
  let pageToken: string | undefined;

  do {
    const res = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: "nextPageToken, files(id, name, mimeType, webViewLink, thumbnailLink)",
      spaces: "drive",
      pageToken,
    });
    for (const f of res.data.files || []) {
      if (f.id && f.name && f.mimeType && SUPPORTED_MIME_TYPES.has(f.mimeType)) {
        files.push({
          id: f.id,
          name: f.name,
          mimeType: f.mimeType,
          webViewLink: f.webViewLink ?? undefined,
          thumbnailLink: f.thumbnailLink ?? undefined,
        });
      }
    }
    pageToken = res.data.nextPageToken ?? undefined;
  } while (pageToken);

  return files;
}

// Requires a real user's OAuth access token (not the service account) —
// see getUserDriveClient's comment above for why.
export async function uploadImageToFolder(
  accessToken: string,
  folderId: string,
  fileName: string,
  mimeType: string,
  buffer: Buffer
): Promise<DriveFile> {
  const drive = getUserDriveClient(accessToken);
  const res = await drive.files.create({
    requestBody: { name: fileName, parents: [folderId] },
    media: { mimeType, body: Readable.from(buffer) },
    fields: "id, name, mimeType, webViewLink, thumbnailLink",
  });
  const f = res.data;
  if (!f.id || !f.name || !f.mimeType) {
    throw new Error("Drive upload succeeded but returned an incomplete file record.");
  }
  return {
    id: f.id,
    name: f.name,
    mimeType: f.mimeType,
    webViewLink: f.webViewLink ?? undefined,
    thumbnailLink: f.thumbnailLink ?? undefined,
  };
}

function isPermissionError(error: unknown): boolean {
  const code = (error as { code?: number | string })?.code;
  return Number(code) === 403;
}

// The service account owns files/folders that resume-core's pipeline
// created, but not ones a real person dragged straight into Drive (or that
// this app uploaded via uploadImageToFolder, which has to run as the user
// for the quota reason above) — Drive only lets the *owner* update those,
// so the service account 403s on them. When that happens and the caller has
// a Google Drive access token for the signed-in user, retry as them: as the
// owner (or as someone with inherited access from the real folder owner)
// they can do what the service account can't.
async function withOwnerFallback<T>(
  fallbackAccessToken: string | undefined,
  run: (drive: drive_v3.Drive) => Promise<T>
): Promise<T> {
  try {
    return await run(getServiceAccountDriveClient());
  } catch (error) {
    if (!fallbackAccessToken || !isPermissionError(error)) throw error;
    return run(getUserDriveClient(fallbackAccessToken));
  }
}

export async function renameFile(fileId: string, name: string, fallbackAccessToken?: string): Promise<void> {
  await withOwnerFallback(fallbackAccessToken, (drive) =>
    drive.files.update({ fileId, requestBody: { name } })
  );
}

// Moves to Drive's Bin rather than permanently erasing — matches what a
// "Delete" click does in Drive's own UI, and stays recoverable from there
// if this was a mistake.
export async function trashFile(fileId: string, fallbackAccessToken?: string): Promise<void> {
  await withOwnerFallback(fallbackAccessToken, (drive) =>
    drive.files.update({ fileId, requestBody: { trashed: true } })
  );
}
