import { ApplicationStatus, EmailHistory } from '@/app/models/EmailHistory';

/**
 * Save sent email to history
 */
export async function saveEmailToHistory(
  userId: string | undefined | null,
  emailData: Omit<EmailHistory, 'id' | 'userId' | 'sentDate'>
): Promise<boolean> {
  if (!userId) {
    console.log('No user logged in, cannot save email history');
    return false;
  }

  try {
    const historyEntry = {
      ...emailData,
      userId,
      sentDate: new Date().toISOString(),
    };

    const response = await fetch('/api/email-history', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(historyEntry),
    });

    if (!response.ok) {
      throw new Error('Failed to save email history');
    }

    console.log('Email saved to history successfully');
    return true;
  } catch (error) {
    console.error('Error saving email to history:', error);
    return false;
  }
}

/**
 * Load email history for current user
 */
export async function loadEmailHistory(
  userId: string | undefined | null,
  limit: number = 50,
  offset: number = 0
): Promise<EmailHistory[]> {
  if (!userId) {
    console.log('No user logged in, cannot load email history');
    return [];
  }

  try {
    const response = await fetch(
      `/api/email-history?userId=${userId}&limit=${limit}&offset=${offset}`
    );

    if (!response.ok) {
      throw new Error('Failed to load email history');
    }

    // Check if response is JSON before parsing
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Non-JSON response received from /api/email-history');
      return [];
    }

    const data = await response.json();
    return data.history || [];
  } catch (error) {
    console.error('Error loading email history:', error);
    return [];
  }
}

/**
 * Load just the sent/pending/total counts for a user, without pulling down
 * every history document (used by the Profile page's stat tiles).
 */
export async function loadEmailHistoryStats(
  userId: string | undefined | null
): Promise<{ total: number; sent: number; pending: number }> {
  const empty = { total: 0, sent: 0, pending: 0 };
  if (!userId) return empty;

  try {
    const response = await fetch(
      `/api/email-history?userId=${userId}&stats=true`
    );
    if (!response.ok) throw new Error('Failed to load email history stats');
    const data = await response.json();
    return data.stats || empty;
  } catch (error) {
    console.error('Error loading email history stats:', error);
    return empty;
  }
}

/**
 * Update the application pipeline stage (Applied / Interview Scheduled /
 * Rejected / Offered / No Response) for a history entry.
 */
export async function updateApplicationStatus(
  emailId: string,
  applicationStatus: ApplicationStatus,
  note?: string
): Promise<boolean> {
  try {
    const response = await fetch(`/api/email-history?emailId=${emailId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ applicationStatus, note }),
    });

    if (!response.ok) {
      throw new Error('Failed to update application status');
    }

    return true;
  } catch (error) {
    console.error('Error updating application status:', error);
    return false;
  }
}

/**
 * Delete email from history
 */
export async function deleteEmailFromHistory(
  emailId: string
): Promise<boolean> {
  try {
    const response = await fetch(`/api/email-history?emailId=${emailId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete email from history');
    }

    console.log('Email deleted from history successfully');
    return true;
  } catch (error) {
    console.error('Error deleting email from history:', error);
    return false;
  }
}
