import { google } from 'googleapis';

export interface GmailSendAttachment {
  filename: string;
  mimeType: string;
  data: string; // base64 encoded
}

export interface SendGmailParams {
  to: string;
  subject: string;
  bodyHtml: string;
  attachments?: GmailSendAttachment[];
}

/**
 * Build a multipart/alternative (plain text + HTML) MIME message, optionally
 * with attachments as a multipart/mixed wrapper. Single source of truth for
 * the message format used by both the immediate-send route and the
 * scheduled-send cron route.
 */
export function buildMimeMessage(params: SendGmailParams): string {
  const boundary = '----=_Part_' + Date.now();
  const altBoundary = '----=_Alt_' + Date.now();
  const nl = '\r\n';

  let message = [
    `To: ${params.to}`,
    `Subject: ${params.subject}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    `Content-Type: multipart/alternative; boundary="${altBoundary}"`,
    '',
    `--${altBoundary}`,
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    params.bodyHtml.replace(/<[^>]*>/g, ''), // Strip HTML tags for plain text version
    '',
    `--${altBoundary}`,
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    params.bodyHtml,
    '',
    `--${altBoundary}--`,
    '',
  ].join(nl);

  if (params.attachments && params.attachments.length > 0) {
    for (const attachment of params.attachments) {
      message += [
        `--${boundary}`,
        `Content-Type: ${attachment.mimeType}; name="${attachment.filename}"`,
        'Content-Transfer-Encoding: base64',
        `Content-Disposition: attachment; filename="${attachment.filename}"`,
        '',
        attachment.data,
        '',
      ].join(nl);
    }
  }

  message += `--${boundary}--`;

  return Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Send a Gmail message on behalf of a user given a valid (already-refreshed
 * where applicable) OAuth access token.
 */
export async function sendGmailMessage(
  params: SendGmailParams,
  accessToken: string
): Promise<{ messageId?: string }> {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  const raw = buildMimeMessage(params);

  const result = await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw },
  });

  return { messageId: result.data.id || undefined };
}

/**
 * Wrap a generated email body with a hidden open-tracking pixel. Shared by
 * the client-side immediate-send path (which uses window.location.origin)
 * and the server-side cron path (which uses APP_BASE_URL, since there's no
 * window in that context).
 */
export function withTrackingPixel(
  bodyHtml: string,
  trackingId: string,
  baseUrl: string
): string {
  return `${bodyHtml}<img src="${baseUrl}/api/track/${trackingId}" width="1" height="1" style="display:none" alt="" />`;
}
