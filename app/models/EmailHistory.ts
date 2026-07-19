// Email History Model

// Pipeline stage in the application process. Distinct from `status`, which
// tracks whether the email itself was delivered (send/transport concern).
export type ApplicationStatus =
  | 'applied'
  | 'interview_scheduled'
  | 'rejected'
  | 'offered'
  | 'no_response';

export interface ApplicationStatusHistoryEntry {
  status: ApplicationStatus;
  changedAt: string;
  note?: string;
}

export interface EmailHistory {
  id: string;
  userId: string;
  companyName: string;
  position: string;
  recipientEmail: string;
  templateId: number;
  templateName: string;
  sentDate: Date;
  status: 'sent' | 'pending' | 'failed';
  // Application pipeline stage, only meaningful once `status === 'sent'`.
  applicationStatus?: ApplicationStatus;
  statusHistory?: ApplicationStatusHistoryEntry[];
  // Open tracking (Gmail sends only — Outlook's mailto: can't be tracked).
  trackingId?: string;
  openCount?: number;
  firstOpenedAt?: string | null;
  lastOpenedAt?: string | null;
  attachments: {
    cv: string;
    coverLetter?: string;
  };
  emailSubject: string;
  emailPreview: string; // First 200 characters of email body
}

// Helper function to create empty email history
export const createEmptyEmailHistory = (): Partial<EmailHistory> => ({
  companyName: '',
  position: '',
  recipientEmail: '',
  templateId: 1,
  templateName: '',
  status: 'pending',
  attachments: {
    cv: '',
  },
  emailSubject: '',
  emailPreview: '',
});

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  applied: 'Applied',
  interview_scheduled: 'Interview Scheduled',
  rejected: 'Rejected',
  offered: 'Offered',
  no_response: 'No Response',
};
