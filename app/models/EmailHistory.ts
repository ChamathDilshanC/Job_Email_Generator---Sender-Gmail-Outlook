// Email History Model
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
