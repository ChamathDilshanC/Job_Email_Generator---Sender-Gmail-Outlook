import { normalizeEmailText } from './emailEncoding';

export type EmailClient = 'gmail' | 'outlook';

export interface EmailParams {
  to: string;
  subject: string;
  body: string;
  bodyHtml?: string; // HTML version for Outlook
  bodyGmail?: string; // Gmail-optimized version with Unicode bold
}

/**
 * Opens Gmail web compose with pre-filled email content
 */
function openGmail(params: EmailParams): void {
  const gmailUrl = new URL('https://mail.google.com/mail/');
  gmailUrl.searchParams.set('view', 'cm');
  gmailUrl.searchParams.set('fs', '1');
  gmailUrl.searchParams.set('to', params.to);
  gmailUrl.searchParams.set('su', normalizeEmailText(params.subject));
  // Use Gmail-optimized body with Unicode bold characters
  gmailUrl.searchParams.set('body', params.bodyGmail || params.body);

  window.open(gmailUrl.toString(), '_blank');
}

/**
 * Opens Outlook (desktop or web) with pre-filled email content using mailto: protocol
 */
function openOutlook(params: EmailParams): void {
  const mailtoUrl = `mailto:${encodeURIComponent(
    params.to
  )}?subject=${encodeURIComponent(normalizeEmailText(params.subject))}&body=${encodeURIComponent(
    params.body
  )}`;
  window.location.href = mailtoUrl;
}

/**
 * Opens the specified email client with pre-filled content
 */
export function openEmailClient(
  client: EmailClient,
  params: EmailParams
): void {
  if (client === 'gmail') {
    openGmail(params);
  } else {
    openOutlook(params);
  }
}

/**
 * Copies text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}
