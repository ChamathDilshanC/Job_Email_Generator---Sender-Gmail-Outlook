import { google } from 'googleapis';
import { encodeMimeSubject, normalizeEmailText } from './emailEncoding';

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

function encodeBase64Utf8(value: string): string {
  return Buffer.from(normalizeEmailText(value), "utf8")
    .toString("base64");
}

function htmlToPlainText(html: string): string {
  return normalizeEmailText(
    String(html || "")
      .replace(/<!--[\s\S]*?-->/g, " ")
      .replace(/<(style|script|head|title|noscript)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|tr|li|h[1-6]|table|section|blockquote)\s*>/gi, "\n")
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
  ).replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n");
}

function addTagStyle(html: string, tag: "p" | "a", style: string): string {
  const pattern = new RegExp(`<${tag}\\b([^>]*)>`, "gi");
  return html.replace(pattern, (match, attributes: string) => {
    const styleMatch = attributes.match(/\sstyle=(["'])([\s\S]*?)\1/i);
    if (styleMatch) {
      const quote = styleMatch[1];
      const existing = styleMatch[2].trim().replace(/;$/, "");
      return `<${tag}${attributes.replace(
        styleMatch[0],
        ` style=${quote}${existing}; ${style}${quote}`
      )}>`;
    }
    return `<${tag} style="${style}"${attributes}>`;
  });
}

export function prepareGmailHtml(bodyHtml: string): string {
  let body = normalizeEmailText(String(bodyHtml || ""));
  body = body
    .replace(/^\s*<(!doctype|html|head|body)\b[^>]*>/gi, "")
    .replace(/<\/(html|head|body)\s*>\s*$/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<meta\b[^>]*>/gi, "");

  body = addTagStyle(body, "p", "margin:0 0 14px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#1f2937");
  body = addTagStyle(body, "a", "text-decoration:underline");

  return `<!doctype html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:24px;background-color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#1f2937;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;border-collapse:collapse;">
<tr>
<td style="width:100%;padding:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#1f2937;">
${body}
</td>
</tr>
</table>
</body>
</html>`;
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
  const gmailHtml = prepareGmailHtml(params.bodyHtml);

  let message = [
    `To: ${params.to}`,
    `Subject: ${encodeMimeSubject(params.subject)}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    `Content-Type: multipart/alternative; boundary="${altBoundary}"`,
    '',
    `--${altBoundary}`,
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    encodeBase64Utf8(htmlToPlainText(gmailHtml)),
    '',
    `--${altBoundary}`,
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    encodeBase64Utf8(gmailHtml),
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
