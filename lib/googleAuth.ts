import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';
import { google } from 'googleapis';
import clientPromise from './mongodb';

const ALGORITHM = 'aes-256-gcm';

function getEncryptionKey(): Buffer {
  const secret = process.env.TOKEN_ENCRYPTION_KEY;
  if (!secret) {
    throw new Error('TOKEN_ENCRYPTION_KEY is not configured');
  }
  // Derive a 32-byte key from whatever string the operator provided, so the
  // env var doesn't have to be an exact-length hex/base64 value.
  return scryptSync(secret, 'jobmail-google-refresh-token', 32);
}

interface EncryptedPayload {
  iv: string;
  authTag: string;
  data: string;
}

export function encryptToken(plainText: string): EncryptedPayload {
  const key = getEncryptionKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
  return {
    iv: iv.toString('base64'),
    authTag: cipher.getAuthTag().toString('base64'),
    data: encrypted.toString('base64'),
  };
}

export function decryptToken(payload: EncryptedPayload): string {
  const key = getEncryptionKey();
  const decipher = createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(payload.iv, 'base64')
  );
  decipher.setAuthTag(Buffer.from(payload.authTag, 'base64'));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(payload.data, 'base64')),
    decipher.final(),
  ]);
  return decrypted.toString('utf8');
}

function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'postmessage'
  );
}

async function getTokensCollection() {
  const client = await clientPromise;
  const db = client.db('job_email_generator');
  return db.collection('google_auth_tokens');
}

/**
 * Persist a refresh token for background (scheduled) sending. Never
 * overwrites an existing stored token with an absent one — Google only
 * returns a refresh_token on a user's first-ever consent for this
 * client+scope combination, so a "no refresh_token" exchange response on a
 * later login is expected, not an error.
 */
export async function storeRefreshTokenIfPresent(
  userId: string,
  refreshToken: string | null | undefined,
  scope: string | undefined
) {
  if (!refreshToken) return false;

  const collection = await getTokensCollection();
  await collection.updateOne(
    { userId },
    {
      $set: {
        encryptedRefreshToken: encryptToken(refreshToken),
        scope: scope || '',
        updatedAt: new Date(),
      },
      $setOnInsert: { createdAt: new Date() },
    },
    { upsert: true }
  );
  return true;
}

export async function hasStoredRefreshToken(userId: string): Promise<boolean> {
  const collection = await getTokensCollection();
  const doc = await collection.findOne({ userId }, { projection: { _id: 1 } });
  return !!doc;
}

export async function deleteStoredRefreshToken(userId: string) {
  const collection = await getTokensCollection();
  await collection.deleteOne({ userId });
}

/**
 * Mint a fresh Gmail-send access token for a user with no browser
 * interaction, using their stored refresh token. Returns null (rather than
 * throwing) when there's nothing on file or the refresh call fails — e.g.
 * the user revoked access externally — so callers can fail just that one
 * send/schedule rather than crashing a batch job.
 */
export async function getValidAccessTokenForUser(
  userId: string
): Promise<string | null> {
  try {
    const collection = await getTokensCollection();
    const doc = await collection.findOne({ userId });
    if (!doc?.encryptedRefreshToken) return null;

    const refreshToken = decryptToken(doc.encryptedRefreshToken);
    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials({ refresh_token: refreshToken });

    const { token } = await oauth2Client.getAccessToken();
    return token || null;
  } catch (error) {
    console.error(`Error refreshing Google access token for user ${userId}:`, error);
    return null;
  }
}

export { getOAuth2Client };
