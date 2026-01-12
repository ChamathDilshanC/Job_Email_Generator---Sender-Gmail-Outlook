import { EmailHistory } from '@/app/models/EmailHistory';
import { getAuth } from 'firebase/auth';

/**
 * Save sent email to history
 */
export async function saveEmailToHistory(
  emailData: Omit<EmailHistory, 'id' | 'userId' | 'sentDate'>
): Promise<boolean> {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    console.log('No user logged in, cannot save email history');
    return false;
  }

  try {
    const historyEntry = {
      ...emailData,
      userId: user.uid,
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
  limit: number = 50,
  offset: number = 0
): Promise<EmailHistory[]> {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    console.log('No user logged in, cannot load email history');
    return [];
  }

  try {
    const response = await fetch(
      `/api/email-history?userId=${user.uid}&limit=${limit}&offset=${offset}`
    );

    if (!response.ok) {
      throw new Error('Failed to load email history');
    }

    const data = await response.json();
    return data.history || [];
  } catch (error) {
    console.error('Error loading email history:', error);
    return [];
  }
}

/**
 * Delete email from history
 */
export async function deleteEmailFromHistory(
  emailId: string
): Promise<boolean> {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    console.log('No user logged in, cannot delete email history');
    return false;
  }

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
