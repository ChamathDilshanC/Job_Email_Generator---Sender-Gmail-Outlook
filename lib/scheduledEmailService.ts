import { GmailSendAttachment } from '@/lib/sendGmail';

export interface ScheduledEmail {
  id: string;
  userId: string;
  to: string;
  subject: string;
  // Omitted by the list endpoint (/api/scheduled-emails GET) to keep the
  // list payload small — only present if fetched individually elsewhere.
  bodyHtml?: string;
  attachments?: GmailSendAttachment[];
  attachmentNames: { cv?: string; coverLetter?: string };
  scheduledFor: string;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  companyName?: string;
  position?: string;
  templateId?: number;
  templateName?: string;
  emailAlignment?: 'left' | 'center' | 'justify';
  emailWidth?: 'narrow' | 'medium' | 'wide';
  trackingId?: string;
  createdAt: string;
  sentAt?: string;
  error?: string;
}

export interface CreateScheduledEmailInput {
  userId: string;
  to: string;
  subject: string;
  bodyHtml: string;
  attachments: GmailSendAttachment[];
  attachmentNames: { cv?: string; coverLetter?: string };
  scheduledFor: string; // ISO string
  companyName?: string;
  position?: string;
  templateId?: number;
  templateName?: string;
  emailAlignment?: 'left' | 'center' | 'justify';
  emailWidth?: 'narrow' | 'medium' | 'wide';
  // Off by default at the call site — an invisible open-tracking pixel is a
  // well-known spam-filter signal, so it's opt-in per send.
  trackOpens?: boolean;
}

export async function scheduleEmail(
  input: CreateScheduledEmailInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/scheduled-emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    const data = await response.json();
    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to schedule email' };
    }
    return { success: true };
  } catch (error) {
    console.error('Error scheduling email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function listScheduledEmails(
  userId: string | undefined | null
): Promise<ScheduledEmail[]> {
  if (!userId) return [];
  try {
    const response = await fetch(`/api/scheduled-emails?userId=${userId}`);
    if (!response.ok) throw new Error('Failed to load scheduled emails');
    const data = await response.json();
    return data.scheduled || [];
  } catch (error) {
    console.error('Error loading scheduled emails:', error);
    return [];
  }
}

export async function getScheduledEmail(
  id: string,
  userId: string | undefined | null
): Promise<ScheduledEmail | null> {
  if (!id || !userId) return null;
  try {
    const response = await fetch(
      `/api/scheduled-emails?id=${encodeURIComponent(id)}&userId=${encodeURIComponent(userId)}`
    );
    if (!response.ok) return null;
    const data = await response.json();
    return data.scheduled || null;
  } catch (error) {
    console.error('Error loading scheduled email details:', error);
    return null;
  }
}

export async function cancelScheduledEmail(
  id: string,
  userId?: string | null
): Promise<boolean> {
  try {
    const params = new URLSearchParams({ id });
    if (userId) params.set('userId', userId);
    const response = await fetch(`/api/scheduled-emails?${params.toString()}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'cancelled' }),
    });
    return response.ok;
  } catch (error) {
    console.error('Error cancelling scheduled email:', error);
    return false;
  }
}

export async function rescheduleEmail(
  id: string,
  scheduledFor: string,
  userId?: string | null
): Promise<boolean> {
  try {
    const params = new URLSearchParams({ id });
    if (userId) params.set('userId', userId);
    const response = await fetch(`/api/scheduled-emails?${params.toString()}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scheduledFor }),
    });
    return response.ok;
  } catch (error) {
    console.error('Error rescheduling email:', error);
    return false;
  }
}

export async function deleteScheduledEmail(
  id: string,
  userId?: string | null
): Promise<boolean> {
  try {
    const params = new URLSearchParams({ id });
    if (userId) params.set('userId', userId);
    const response = await fetch(`/api/scheduled-emails?${params.toString()}`, {
      method: 'DELETE',
    });
    return response.ok;
  } catch (error) {
    console.error('Error deleting scheduled email:', error);
    return false;
  }
}

export async function checkGoogleBackgroundSendStatus(
  userId: string | undefined | null
): Promise<boolean> {
  if (!userId) return false;
  try {
    const response = await fetch(`/api/auth/google/status?userId=${userId}`);
    if (!response.ok) return false;
    const data = await response.json();
    return !!data.hasRefreshToken;
  } catch (error) {
    console.error('Error checking Google background send status:', error);
    return false;
  }
}
