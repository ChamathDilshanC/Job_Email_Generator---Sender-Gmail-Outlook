export interface GmailAttachment {
  filename: string;
  mimeType: string;
  data: string; // base64 encoded
}

export interface SendEmailParams {
  to: string;
  subject: string;
  body: string;
  attachments?: GmailAttachment[];
}

/**
 * Convert File object to base64 string
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data:mime/type;base64, prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
}

/**
 * Create MIME message for Gmail API
 */
export function createMimeMessage(params: SendEmailParams): string {
  const boundary = '----=_Part_' + Date.now();
  const nl = '\r\n';

  let message = [
    `To: ${params.to}`,
    `Subject: ${params.subject}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    params.body,
    '',
  ].join(nl);

  // Add attachments
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

  // Encode the entire message in base64url
  return btoa(message)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Send email with attachments via Gmail API
 */
export async function sendEmailWithAttachments(
  params: SendEmailParams,
  accessToken: string
): Promise<{ success: boolean; error?: string; authError?: boolean }> {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...params,
        accessToken,
      }),
    });

    // Check if response is JSON before parsing
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Non-JSON response received:', text);
      return {
        success: false,
        error: `Server returned non-JSON response (${response.status}). This usually indicates a server configuration issue.`,
        authError: false,
      };
    }

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to send email',
        authError: data.authError || false,
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in sendEmailWithAttachments:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
