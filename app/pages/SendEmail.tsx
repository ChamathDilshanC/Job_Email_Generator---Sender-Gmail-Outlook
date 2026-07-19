'use client';

import EmailSendingLoader from '@/app/components/EmailSendingLoader';
import SendPreviewModal from '@/app/components/SendPreviewModal';
import { AlertDialog } from '@/components/alert-dialog';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { GoogleSignInButton } from '@/components/google-sign-in';
import JobFileUpload from '@/components/job-file-upload';
import type { PageType } from '@/components/sidebar-01/types';
import { useAuth } from '@/contexts/AuthContext';
import { copyToClipboard } from '@/lib/emailClient';
import { saveEmailToHistory } from '@/lib/emailHistoryService';
import { generateEmail, type EmailData } from '@/lib/emailTemplate';
import { generateEmailFromTemplate } from '@/lib/emailTemplateGenerator';
import {
  fileToBase64,
  sendEmailWithAttachments,
  type GmailAttachment,
} from '@/lib/gmailClient';
import { fadeInUp, staggerContainer } from '@/lib/motion';
import {
  listResumeProfiles,
  loadResumeData,
  ResumeData,
  ResumeProfileSummary,
} from '@/lib/resumeDataService';
import { scheduleEmail } from '@/lib/scheduledEmailService';
import {
  JobDetails,
  TEMPLATE_METADATA,
  TemplateType,
} from '@/lib/templateTypes';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Copy,
  LogOut,
  Mail,
  Paperclip,
  Pencil,
  Send,
  Trash2,
  XCircle,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { ChangeEvent, FormEvent, ReactNode, useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const EmailBodyEditor = dynamic(
  () => import('@/app/components/EmailBodyEditor'),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[200px] animate-pulse rounded-lg border border-border bg-muted/30" />
    ),
  }
);

type AdditionalDetails = Omit<
  JobDetails,
  'companyName' | 'position' | 'recipientEmail'
>;

const EMPTY_ADDITIONAL_DETAILS: AdditionalDetails = {
  recruiterName: '',
  referralName: '',
  referralRole: '',
  interviewerName: '',
  interviewDate: '',
  daysSinceApplied: '',
  offerDeadline: '',
  decision: 'accept',
};

interface SendEmailProps {
  onNavigate?: (page: PageType) => void;
}

function Field({
  label,
  action,
  hint,
  className = '',
  children,
}: {
  label: string;
  action?: ReactNode;
  hint?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <label className="text-xs font-medium text-muted-foreground">
          {label}
        </label>
        {action}
      </div>
      {children}
      {hint}
    </div>
  );
}

export default function SendEmail({ onNavigate }: SendEmailProps = {}) {
  const [formData, setFormData] = useState<EmailData>({
    companyName: '',
    position: '',
    recipientEmail: '',
  });

  const [additionalDetails, setAdditionalDetails] = useState<AdditionalDetails>(
    EMPTY_ADDITIONAL_DETAILS
  );
  const [showAdditionalDetails, setShowAdditionalDetails] = useState(false);

  const [emailClient, setEmailClient] = useState<'gmail' | 'outlook'>('gmail');
  const [copySuccess, setCopySuccess] = useState(false);
  const [attachments, setAttachments] = useState<{
    cv: File | null;
    coverLetter: File | null;
  }>({ cv: null, coverLetter: null });
  const [isSending, setIsSending] = useState(false);
  const [requireCoverLetter, setRequireCoverLetter] = useState(false);

  // Template selection and resume data
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>(
    TemplateType.PROFESSIONAL_INTRO
  );
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [isLoadingResume, setIsLoadingResume] = useState(false);
  const [resumeProfiles, setResumeProfiles] = useState<ResumeProfileSummary[]>(
    []
  );
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');

  // Auto-fill from job URL
  const [jobUrl, setJobUrl] = useState('');
  const [isParsingJobUrl, setIsParsingJobUrl] = useState(false);

  // Rich text body editing + preview-before-send
  const [editedBodyHtml, setEditedBodyHtml] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);

  // Send now vs schedule for later (Gmail only)
  const [sendMode, setSendMode] = useState<'now' | 'schedule'>('now');
  const [scheduledFor, setScheduledFor] = useState<Date | null>(null);

  // Alert Dialog State
  const [alertDialog, setAlertDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    type: 'success' | 'error' | 'info' | 'warning';
    onConfirm?: () => void;
    cancelText?: string;
    confirmText?: string;
    variant?:
      | 'default'
      | 'destructive'
      | 'outline'
      | 'secondary'
      | 'ghost'
      | 'link';
  }>({ open: false, title: '', description: '', type: 'info' });

  // Use Auth Context
  const {
    isAuthenticated,
    accessToken,
    userEmail,
    user,
    handleSignOut,
    isLoading: authLoading,
  } = useAuth();

  // Load resume data and selected template on mount and when auth changes
  useEffect(() => {
    const fetchResumeData = async () => {
      // Only load resume data if user is authenticated
      if (!isAuthenticated) {
        setResumeData(null); // Clear resume data when not authenticated
        setResumeProfiles([]);
        setSelectedProfileId('');
        setIsLoadingResume(false);
        return;
      }

      setIsLoadingResume(true);
      try {
        const profiles = await listResumeProfiles(user?.uid);
        setResumeProfiles(profiles);
        const defaultProfileId =
          profiles.find(p => p.isDefault)?.profileId || profiles[0]?.profileId;
        setSelectedProfileId(defaultProfileId || '');

        const data = await loadResumeData(user?.uid, defaultProfileId);
        setResumeData(data);
      } catch (error) {
        console.error('Error loading resume data:', error);
      } finally {
        setIsLoadingResume(false);
      }
    };

    // Load selected template from localStorage
    const savedTemplateId = localStorage.getItem('selectedTemplateId');
    if (savedTemplateId) {
      setSelectedTemplate(parseInt(savedTemplateId) as TemplateType);
    }

    fetchResumeData();
  }, [isAuthenticated, user?.uid]); // Added isAuthenticated to dependency array

  const handleProfileChange = async (profileId: string) => {
    setSelectedProfileId(profileId);
    setIsLoadingResume(true);
    try {
      const data = await loadResumeData(user?.uid, profileId);
      setResumeData(data);
    } catch (error) {
      console.error('Error loading resume profile:', error);
    } finally {
      setIsLoadingResume(false);
    }
  };

  const handleAutoFillFromUrl = async () => {
    if (!jobUrl.trim()) return;

    setIsParsingJobUrl(true);
    try {
      const response = await fetch('/api/job-url/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: jobUrl.trim() }),
      });
      const data = await response.json();

      if (!response.ok || (!data.position && !data.companyName)) {
        setAlertDialog({
          open: true,
          title: "Couldn't Auto-fill",
          description:
            data.error ||
            "We couldn't detect the company/position from that page. LinkedIn's login-walled listings often block this — please fill the fields in manually.",
          type: 'warning',
        });
        return;
      }

      setFormData(prev => ({
        ...prev,
        companyName: data.companyName || prev.companyName,
        position: data.position || prev.position,
      }));

      setAlertDialog({
        open: true,
        title: 'Auto-filled',
        description:
          'Company/position were filled in from the job posting — double check them before sending.',
        type: 'success',
      });
    } catch (error) {
      console.error('Error auto-filling from job URL:', error);
      setAlertDialog({
        open: true,
        title: 'Error',
        description: 'Failed to read that job URL. Please fill the fields in manually.',
        type: 'error',
      });
    } finally {
      setIsParsingJobUrl(false);
    }
  };

  // Show alert when page loads if user is not signed in
  useEffect(() => {
    // Wait for auth to finish loading
    if (!authLoading && !isAuthenticated) {
      setAlertDialog({
        open: true,
        title: 'Sign In Required',
        description:
          'Please sign in with Google to send emails via Gmail and use all features. You can still use Outlook without signing in.',
        type: 'warning',
      });
    }
  }, [authLoading, isAuthenticated]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAdditionalDetailChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setAdditionalDetails(
      prev =>
        ({
          ...prev,
          [name]: value,
        }) as AdditionalDetails
    );
  };

  const handleSignOutClick = () => {
    setAlertDialog({
      open: true,
      title: 'Sign Out',
      description: 'Are you sure you want to sign out?',
      type: 'warning',
      confirmText: 'Sign Out',
      cancelText: 'Cancel',
      variant: 'destructive',
      onConfirm: async () => {
        await handleSignOut();
        setAlertDialog(prev => ({ ...prev, open: false }));
      },
    });
  };

  // Validate the form, then open the preview modal instead of sending
  // immediately — the actual send happens from the modal's confirm action.
  const handleOpenPreview = (e: FormEvent) => {
    e.preventDefault();

    if (
      !formData.companyName ||
      !formData.position ||
      !formData.recipientEmail
    ) {
      setAlertDialog({
        open: true,
        title: 'Missing Information',
        description:
          'Please fill in all required fields: Company Name, Position, and Recipient Email.',
        type: 'warning',
      });
      return;
    }

    // Check if files are uploaded
    if (!isFileUploadValid()) {
      setAlertDialog({
        open: true,
        title: 'Missing Files',
        description:
          'Please upload your CV ' +
          (requireCoverLetter ? 'and Cover Letter ' : '') +
          'before sending.',
        type: 'warning',
      });
      return;
    }

    // Check if user is authenticated for Gmail API
    if (!isAuthenticated || !accessToken) {
      setAlertDialog({
        open: true,
        title: 'Authentication Required',
        description:
          'Please sign in with Google to send emails with attachments.',
        type: 'warning',
      });
      return;
    }

    if (
      sendMode === 'schedule' &&
      (!scheduledFor || scheduledFor.getTime() <= Date.now())
    ) {
      setAlertDialog({
        open: true,
        title: 'Pick a Future Date & Time',
        description:
          'Please choose when this email should be sent — it must be in the future.',
        type: 'warning',
      });
      return;
    }

    setShowPreviewModal(true);
  };

  const handleConfirmSend = async () => {
    if (!generatedEmail) return;

    const subject = generatedEmail.subject;
    const plainTextFallback =
      'bodyText' in generatedEmail
        ? generatedEmail.bodyText
        : generatedEmail.body;

    setIsSending(true);

    try {
      if (emailClient === 'outlook') {
        // For Outlook, use mailto: link (opens default email client). Strip
        // HTML from the (possibly user-edited) rich text body so manual
        // edits carry over into the plain-text mailto body too.
        const plainBody =
          displayedBodyHtml
            .replace(/<[^>]*>/g, ' ')
            .replace(/&nbsp;/g, ' ')
            .replace(/\s+/g, ' ')
            .trim() || plainTextFallback;

        const attachmentText =
          attachments.cv || attachments.coverLetter
            ? '\n\nNote: Please attach your files manually:\n' +
              (attachments.cv ? `• ${attachments.cv.name}\n` : '') +
              (attachments.coverLetter
                ? `• ${attachments.coverLetter.name}`
                : '')
            : '';

        const mailtoLink = `mailto:${
          formData.recipientEmail
        }?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
          plainBody + attachmentText
        )}`;

        window.location.href = mailtoLink;

        setShowPreviewModal(false);
        setAlertDialog({
          open: true,
          title: 'Opening Outlook...',
          description: `Your default email client is opening. Please attach your files manually if needed.`,
          type: 'info',
        });

        setIsSending(false);
        return;
      }

      // Gmail API sending
      if (!isAuthenticated || !accessToken) {
        setAlertDialog({
          open: true,
          title: 'Authentication Required',
          description: 'Please sign in with Google to send emails via Gmail.',
          type: 'warning',
        });
        setIsSending(false);
        return;
      }

      // Convert files to base64 attachments
      const attachmentsList: GmailAttachment[] = [];

      if (attachments.cv) {
        const cvBase64 = await fileToBase64(attachments.cv);
        attachmentsList.push({
          filename: attachments.cv.name,
          mimeType: attachments.cv.type,
          data: cvBase64,
        });
      }

      if (attachments.coverLetter) {
        const clBase64 = await fileToBase64(attachments.coverLetter);
        attachmentsList.push({
          filename: attachments.coverLetter.name,
          mimeType: attachments.coverLetter.type,
          data: clBase64,
        });
      }

      // Embed a hidden open-tracking pixel. Only possible for Gmail sends —
      // Outlook's mailto: hands off to the user's own mail client, which we
      // never see again.
      const trackingId = crypto.randomUUID();
      const bodyWithTracking = `${displayedBodyHtml}<img src="${window.location.origin}/api/track/${trackingId}" width="1" height="1" style="display:none" alt="" />`;

      // Send email via Gmail API
      const result = await sendEmailWithAttachments(
        {
          to: formData.recipientEmail,
          subject,
          body: bodyWithTracking,
          attachments: attachmentsList.length > 0 ? attachmentsList : undefined,
        },
        accessToken
      );

      if (result.success) {
        const attachmentText =
          attachmentsList.length > 0
            ? `\n\nAttachments included:\n${attachmentsList
                .map(a => `• ${a.filename}`)
                .join('\n')}`
            : '';

        // Save email to history
        const templateName =
          TEMPLATE_METADATA.find(t => t.id === selectedTemplate)?.name ||
          'Custom Template';
        await saveEmailToHistory(user?.uid, {
          companyName: formData.companyName,
          position: formData.position,
          recipientEmail: formData.recipientEmail,
          templateId: selectedTemplate,
          templateName,
          status: 'sent',
          attachments: {
            cv: attachments.cv?.name || '',
            coverLetter: attachments.coverLetter?.name,
          },
          emailSubject: subject,
          emailPreview: plainTextFallback.substring(0, 200) + '...',
          trackingId,
        });

        setShowPreviewModal(false);
        setAlertDialog({
          open: true,
          title: 'Email Sent Successfully!',
          description: `Your email has been sent via Gmail to ${formData.recipientEmail}.${attachmentText}`,
          type: 'success',
        });
      } else {
        // Check if it's an authentication error
        if ((result as any).authError) {
          // Sign out the user to clear expired token
          await handleSignOut();

          setAlertDialog({
            open: true,
            title: 'Authentication Expired',
            description:
              'Your session has expired. Please sign in again to send emails.',
            type: 'warning',
          });
        } else {
          throw new Error(result.error || 'Failed to send email');
        }
      }
    } catch (error) {
      console.error('Error sending email:', error);

      // Check if error message indicates auth issue
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred';
      const isAuthError =
        errorMessage.includes('Authentication') ||
        errorMessage.includes('authentication');

      if (isAuthError) {
        await handleSignOut();
      }

      setAlertDialog({
        open: true,
        title: isAuthError ? 'Authentication Expired' : 'Failed to Send Email',
        description: isAuthError
          ? 'Your session has expired. Please sign in again to send emails.'
          : errorMessage,
        type: isAuthError ? 'warning' : 'error',
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleConfirmSchedule = async () => {
    if (!generatedEmail || !scheduledFor || !user?.uid) return;

    setIsSending(true);
    try {
      const attachmentsList: GmailAttachment[] = [];

      if (attachments.cv) {
        const cvBase64 = await fileToBase64(attachments.cv);
        attachmentsList.push({
          filename: attachments.cv.name,
          mimeType: attachments.cv.type,
          data: cvBase64,
        });
      }

      if (attachments.coverLetter) {
        const clBase64 = await fileToBase64(attachments.coverLetter);
        attachmentsList.push({
          filename: attachments.coverLetter.name,
          mimeType: attachments.coverLetter.type,
          data: clBase64,
        });
      }

      const templateName =
        TEMPLATE_METADATA.find(t => t.id === selectedTemplate)?.name ||
        'Custom Template';

      const result = await scheduleEmail({
        userId: user.uid,
        to: formData.recipientEmail,
        subject: generatedEmail.subject,
        bodyHtml: displayedBodyHtml,
        attachments: attachmentsList,
        attachmentNames: {
          cv: attachments.cv?.name,
          coverLetter: attachments.coverLetter?.name,
        },
        scheduledFor: scheduledFor.toISOString(),
        companyName: formData.companyName,
        position: formData.position,
        templateId: selectedTemplate,
        templateName,
      });

      if (result.success) {
        setShowPreviewModal(false);
        setAlertDialog({
          open: true,
          title: 'Email Scheduled!',
          description: `This email will be sent to ${formData.recipientEmail} on ${scheduledFor.toLocaleString()}. Manage it from the Scheduled page.`,
          type: 'success',
        });
        setSendMode('now');
        setScheduledFor(null);
      } else {
        throw new Error(result.error || 'Failed to schedule email');
      }
    } catch (error) {
      console.error('Error scheduling email:', error);
      setAlertDialog({
        open: true,
        title: 'Failed to Schedule Email',
        description:
          error instanceof Error ? error.message : 'An unknown error occurred',
        type: 'error',
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleCopyEmail = async () => {
    if (!generatedEmail) return;

    // Reflect manual Quill edits if the user made any, otherwise fall back
    // to the freshly-generated plain text.
    const body = editedBodyHtml
      ? editedBodyHtml
          .replace(/<[^>]*>/g, ' ')
          .replace(/&nbsp;/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
      : 'bodyText' in generatedEmail
        ? generatedEmail.bodyText
        : generatedEmail.body;

    const fullEmail = `Subject: ${generatedEmail.subject}\n\n${body}`;

    const success = await copyToClipboard(fullEmail);
    if (success) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleEditCompany = () => {
    // Focus on company name input
    const input = document.querySelector(
      'input[name="companyName"]'
    ) as HTMLInputElement;
    input?.focus();
  };

  const handleDeleteCompany = () => {
    setFormData(prev => ({
      ...prev,
      companyName: '',
    }));
  };

  const isFormValid =
    formData.companyName && formData.position && formData.recipientEmail;

  // Check if file upload requirements are met
  const isFileUploadValid = () => {
    // CV is always required
    if (!attachments.cv) {
      return false;
    }

    // If cover letter is required, check if it's uploaded
    if (requireCoverLetter && !attachments.coverLetter) {
      return false;
    }

    return true;
  };

  // Send button should only be enabled when form is valid AND files are uploaded AND resume data exists
  const canSendEmail = isFormValid && isFileUploadValid() && !!resumeData;

  // Generate email preview
  const generatedEmail = isFormValid
    ? resumeData
      ? generateEmailFromTemplate(selectedTemplate, resumeData, {
          companyName: formData.companyName,
          position: formData.position,
          recipientEmail: formData.recipientEmail,
          ...additionalDetails,
        })
      : generateEmail(formData)
    : null;

  // The actual body that gets edited/sent: the user's manual Quill edits
  // once they've made any, otherwise whatever the template generator
  // currently produces (so it stays live as company/position/etc. change).
  const displayedBodyHtml = editedBodyHtml ?? generatedEmail?.bodyHtml ?? '';

  const requiredBadge = (
    <span className="badge text-[10px] uppercase tracking-wide">
      Required
    </span>
  );

  return (
    <>
      {/* Loading Animation */}
      {isSending && <EmailSendingLoader message="Sending your email..." />}

      <motion.div
        variants={staggerContainer(0.08)}
        initial="hidden"
        animate="visible"
        className="w-full"
      >
        <motion.div variants={fadeInUp} className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Send Application Email
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Fill in the details below and JobMail will generate a
            personalized email from your resume.
          </p>
        </motion.div>

        {/* Resume Builder Required Warning */}
        <AnimatePresence>
          {!resumeData && !isLoadingResume && (
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="mb-6 flex flex-wrap items-center gap-4 rounded-2xl border-2 border-red-500 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-5"
            >
              <AlertTriangle className="h-8 w-8 shrink-0 text-red-500" />
              <div className="min-w-[200px] flex-1">
                <h3 className="mb-1 font-semibold text-red-600 dark:text-red-400">
                  Resume Builder Required
                </h3>
                <p className="text-sm text-red-800 dark:text-red-300">
                  You must complete your Resume Builder profile before
                  sending emails. This ensures your application emails are
                  personalized and professional.
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="btn btn-primary whitespace-nowrap"
                onClick={() => {
                  if (!isAuthenticated) {
                    setAlertDialog({
                      open: true,
                      title: 'Sign In Required',
                      description:
                        'Please sign in with your Google account to access the Resume Builder.',
                      type: 'warning',
                    });
                    return;
                  }
                  if (isAuthenticated && onNavigate) {
                    onNavigate('resume');
                  }
                }}
                title={
                  !isAuthenticated
                    ? 'Sign in to access Resume Builder'
                    : 'Go to Resume Builder'
                }
              >
                Go to Resume Builder →
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          variants={fadeInUp}
          className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
        >
          {/* Header */}
          <div className="flex flex-col gap-4 border-b border-border p-6 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Application Details
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              {isAuthenticated && userEmail ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 shadow-sm">
                    <svg width="16" height="16" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26-.19-.58z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      {userEmail}
                    </span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="rounded-full border border-border p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    onClick={handleSignOutClick}
                    title="Sign Out"
                  >
                    <LogOut className="h-4 w-4" />
                  </motion.button>
                </div>
              ) : (
                <GoogleSignInButton
                  onSuccess={() => {
                    setAlertDialog({
                      open: true,
                      title: 'Signed In Successfully!',
                      description: 'Refreshing page...',
                      type: 'success',
                    });
                    setTimeout(() => {
                      window.location.reload();
                    }, 1000);
                  }}
                  onError={error => {
                    setAlertDialog({
                      open: true,
                      title: 'Sign In Failed',
                      description: error,
                      type: 'error',
                    });
                  }}
                />
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative rounded-full border border-border p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                onClick={handleCopyEmail}
                disabled={!isFormValid}
                title="Copy Email"
              >
                <Copy className="h-4 w-4" />
                {copySuccess && (
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black px-2 py-1 text-xs text-white">
                    Copied!
                  </span>
                )}
              </motion.button>
              <motion.button
                whileHover={{ scale: canSendEmail ? 1.03 : 1 }}
                whileTap={{ scale: canSendEmail ? 0.97 : 1 }}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={handleOpenPreview}
                disabled={isSending}
              >
                <Send className="h-4 w-4" />
                {isSending
                  ? 'Sending...'
                  : sendMode === 'schedule' && emailClient === 'gmail'
                    ? 'Review & Schedule'
                    : emailClient === 'gmail'
                      ? 'Review & Send via Gmail'
                      : 'Review & Send via Outlook'}
              </motion.button>
            </div>
          </div>

          {/* Auto-fill from Job URL */}
          <div className="px-6 pt-6">
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Paste Job URL (optional)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                className="form-input flex-1"
                placeholder="e.g., https://boards.greenhouse.io/company/jobs/12345"
                value={jobUrl}
                onChange={e => setJobUrl(e.target.value)}
              />
              <button
                type="button"
                onClick={handleAutoFillFromUrl}
                disabled={!jobUrl.trim() || isParsingJobUrl}
                className="whitespace-nowrap rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isParsingJobUrl ? 'Reading…' : 'Auto-fill'}
              </button>
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Works best on Greenhouse/Lever/Workday and similar job boards.
              LinkedIn&apos;s login-walled listings may not auto-fill reliably.
            </p>
          </div>

          {/* Fields */}
          <div className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-2">
            <Field
              label="Company Name"
              action={
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={handleEditCompany}
                    title="Edit company name"
                    className="rounded p-1 text-amber-500 transition-colors hover:bg-amber-500/10"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteCompany}
                    title="Clear company name"
                    className="rounded p-1 text-red-500 transition-colors hover:bg-red-500/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              }
            >
              <input
                type="text"
                name="companyName"
                className="form-input"
                placeholder="e.g., Google, Microsoft"
                value={formData.companyName}
                onChange={handleInputChange}
              />
            </Field>

            <Field label="Position" action={requiredBadge}>
              <input
                type="text"
                name="position"
                className="form-input"
                placeholder="e.g., Full Stack Developer"
                value={formData.position}
                onChange={handleInputChange}
              />
            </Field>

            <Field label="Recipient Email" action={requiredBadge}>
              <input
                type="email"
                name="recipientEmail"
                className="form-input"
                placeholder="e.g., hr@company.com"
                value={formData.recipientEmail}
                onChange={handleInputChange}
              />
            </Field>

            {resumeProfiles.length > 1 && (
              <Field label="Resume Profile">
                <select
                  className="form-select"
                  value={selectedProfileId}
                  onChange={e => handleProfileChange(e.target.value)}
                >
                  {resumeProfiles.map(profile => (
                    <option key={profile.profileId} value={profile.profileId}>
                      {profile.profileName}
                      {profile.isDefault ? ' (Default)' : ''}
                    </option>
                  ))}
                </select>
              </Field>
            )}

            <Field label="Send Via">
              <div className="inline-flex rounded-lg border border-border p-1">
                {(['gmail', 'outlook'] as const).map(client => (
                  <button
                    key={client}
                    type="button"
                    onClick={() => {
                      setEmailClient(client);
                      if (client === 'outlook') setSendMode('now');
                    }}
                    className={`flex-1 rounded-md px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
                      emailClient === client
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {client}
                  </button>
                ))}
              </div>
            </Field>

            {emailClient === 'gmail' && (
              <Field label="When to Send">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex rounded-lg border border-border p-1">
                    {(['now', 'schedule'] as const).map(mode => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setSendMode(mode)}
                        className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                          sendMode === mode
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {mode === 'now' ? 'Send Now' : 'Schedule for Later'}
                      </button>
                    ))}
                  </div>
                  {sendMode === 'schedule' && (
                    <DatePicker
                      selected={scheduledFor}
                      onChange={date => setScheduledFor(date)}
                      showTimeSelect
                      timeIntervals={15}
                      dateFormat="MMM d, yyyy h:mm aa"
                      minDate={new Date()}
                      placeholderText="Pick a date & time"
                      className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-300 transition-all duration-200 focus:outline-none focus:border-[#3b3be3] dark:focus:border-[#818cf8] focus:ring-3 focus:ring-blue-100 dark:focus:ring-[#818cf8]/30 hover:border-[#3b3be3] dark:hover:border-[#818cf8]"
                    />
                  )}
                </div>
                {sendMode === 'schedule' && (
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    Sent automatically at the scheduled time, even if this
                    browser is closed — as long as your Google account has
                    background sending enabled (see the Scheduled page).
                  </p>
                )}
              </Field>
            )}

            <Field
              label="Email Template"
              className="sm:col-span-2"
              action={
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    !resumeData
                      ? 'bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400'
                      : 'bg-blue-100 dark:bg-[#818cf8]/15 text-blue-800 dark:text-[#a5b4fc]'
                  }`}
                >
                  {!resumeData ? (
                    <>
                      <AlertTriangle className="h-3 w-3" /> Resume Required
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-3 w-3" /> Ready
                    </>
                  )}
                </span>
              }
              hint={
                !resumeData && (
                  <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">
                    Resume Builder must be completed to send emails
                  </p>
                )
              }
            >
              <select
                className="form-select"
                value={selectedTemplate}
                onChange={e =>
                  setSelectedTemplate(parseInt(e.target.value) as TemplateType)
                }
                disabled={!resumeData}
              >
                {TEMPLATE_METADATA.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {/* Cover Letter Requirement Toggle */}
          <div className="px-6">
            <div className="flex items-center gap-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 p-4">
              <label className="flex items-center gap-3 cursor-pointer text-[0.95rem] font-medium text-gray-800 dark:text-gray-200">
                <input
                  type="checkbox"
                  checked={requireCoverLetter}
                  onChange={e => setRequireCoverLetter(e.target.checked)}
                  className="h-[18px] w-[18px] cursor-pointer accent-primary"
                />
                <span>Require Cover Letter</span>
              </label>
              <span className="text-sm italic text-gray-500 dark:text-gray-400">
                {requireCoverLetter
                  ? '✓ Cover letter is required'
                  : 'Cover letter is optional'}
              </span>
            </div>
          </div>

          {/* Additional Details for scenario templates (cold outreach, referral,
              interview thank-you, follow-up, networking, offer response) */}
          <div className="mt-4 px-6">
            <button
              type="button"
              onClick={() => setShowAdditionalDetails(v => !v)}
              className="flex w-full items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-left text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              <span>
                Additional Details{' '}
                <span className="font-normal text-muted-foreground">
                  (optional — for outreach, referral, interview &amp; offer
                  templates)
                </span>
              </span>
              <motion.span
                animate={{ rotate: showAdditionalDetails ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {showAdditionalDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 gap-4 rounded-b-lg border border-t-0 border-border bg-card/50 p-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                        Recruiter / Hiring Manager Name
                      </label>
                      <input
                        type="text"
                        name="recruiterName"
                        className="form-input"
                        placeholder="e.g., Jane Smith"
                        value={additionalDetails.recruiterName}
                        onChange={handleAdditionalDetailChange}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                        Referred By
                      </label>
                      <input
                        type="text"
                        name="referralName"
                        className="form-input"
                        placeholder="e.g., Sam Perera"
                        value={additionalDetails.referralName}
                        onChange={handleAdditionalDetailChange}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                        Referral&apos;s Role
                      </label>
                      <input
                        type="text"
                        name="referralRole"
                        className="form-input"
                        placeholder="e.g., Senior Engineer"
                        value={additionalDetails.referralRole}
                        onChange={handleAdditionalDetailChange}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                        Interviewer Name
                      </label>
                      <input
                        type="text"
                        name="interviewerName"
                        className="form-input"
                        placeholder="e.g., Priya Nair"
                        value={additionalDetails.interviewerName}
                        onChange={handleAdditionalDetailChange}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                        Interview Date
                      </label>
                      <input
                        type="text"
                        name="interviewDate"
                        className="form-input"
                        placeholder="e.g., July 15"
                        value={additionalDetails.interviewDate}
                        onChange={handleAdditionalDetailChange}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                        Days Since Applied
                      </label>
                      <input
                        type="text"
                        name="daysSinceApplied"
                        className="form-input"
                        placeholder="e.g., 2 weeks"
                        value={additionalDetails.daysSinceApplied}
                        onChange={handleAdditionalDetailChange}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                        Offer Deadline
                      </label>
                      <input
                        type="text"
                        name="offerDeadline"
                        className="form-input"
                        placeholder="e.g., Friday"
                        value={additionalDetails.offerDeadline}
                        onChange={handleAdditionalDetailChange}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                        Offer Decision
                      </label>
                      <select
                        name="decision"
                        className="form-select"
                        value={additionalDetails.decision}
                        onChange={handleAdditionalDetailChange}
                      >
                        <option value="accept">Accepting</option>
                        <option value="decline">Declining</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* File Upload Sections */}
          <div className="mt-4 px-6 pb-6">
            <JobFileUpload
              onFilesChange={setAttachments}
              onAlert={(title, description, type) => {
                setAlertDialog({
                  open: true,
                  title,
                  description,
                  type,
                });
              }}
            />

            {/* Upload Status Indicators */}
            <div className="mt-4 rounded-lg border border-blue-100 dark:border-[#818cf8]/25 bg-[#f0f7ff] dark:bg-[#818cf8]/10 p-4">
              <div className="mb-2 text-sm font-semibold text-[#1a5490] dark:text-[#a5b4fc]">
                Upload Requirements
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-sm">
                  {attachments.cv ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span
                    className={
                      attachments.cv
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }
                  >
                    CV{' '}
                    {attachments.cv ? `(${attachments.cv.name})` : '(Required)'}
                  </span>
                </div>
                {requireCoverLetter && (
                  <div className="flex items-center gap-2 text-sm">
                    {attachments.coverLetter ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span
                      className={
                        attachments.coverLetter
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }
                    >
                      Cover Letter{' '}
                      {attachments.coverLetter
                        ? `(${attachments.coverLetter.name})`
                        : '(Required)'}
                    </span>
                  </div>
                )}
              </div>
              <AnimatePresence>
                {!canSendEmail && isFormValid && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`mt-3 overflow-hidden rounded p-2 text-sm ${
                      !resumeData
                        ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400'
                        : 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300'
                    }`}
                  >
                    {!resumeData
                      ? '⚠️ Complete Resume Builder to enable email sending'
                      : '⚠️ Please upload all required files to enable the send button'}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Email Body - editable rich text, mirrors the mock card on the landing page */}
          <AnimatePresence>
            {isFormValid && generatedEmail && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mx-6 mb-6 overflow-hidden rounded-xl border border-border"
              >
                <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/40 px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">
                      Email Body{editedBodyHtml !== null ? ' (edited)' : ''}
                    </span>
                  </div>
                  {editedBodyHtml !== null && (
                    <button
                      type="button"
                      onClick={() => setShowRegenerateConfirm(true)}
                      className="text-xs font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                    >
                      Regenerate from template
                    </button>
                  )}
                </div>
                <div className="space-y-2 border-b border-border px-4 py-4 text-sm">
                  <div className="flex gap-3">
                    <span className="w-16 shrink-0 font-medium text-muted-foreground">
                      To
                    </span>
                    <span className="text-foreground">
                      {formData.recipientEmail}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <span className="w-16 shrink-0 font-medium text-muted-foreground">
                      Subject
                    </span>
                    <span className="text-foreground">
                      {generatedEmail.subject}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <EmailBodyEditor
                    value={displayedBodyHtml}
                    onChange={html => setEditedBodyHtml(html)}
                  />
                </div>
                {(attachments.cv || attachments.coverLetter) && (
                  <div className="flex items-center gap-1.5 border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
                    <Paperclip className="h-3.5 w-3.5" />
                    {[attachments.cv?.name, attachments.coverLetter?.name]
                      .filter(Boolean)
                      .join(', ')}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* Preview-before-send Modal */}
      <SendPreviewModal
        open={showPreviewModal}
        onOpenChange={setShowPreviewModal}
        to={formData.recipientEmail}
        subject={generatedEmail?.subject || ''}
        bodyHtml={displayedBodyHtml}
        attachmentNames={[attachments.cv?.name, attachments.coverLetter?.name].filter(
          (name): name is string => !!name
        )}
        isSending={isSending}
        emailClient={emailClient}
        sendMode={sendMode}
        scheduledFor={scheduledFor}
        onConfirm={
          sendMode === 'schedule' && emailClient === 'gmail'
            ? handleConfirmSchedule
            : handleConfirmSend
        }
      />

      {/* Regenerate-from-template confirmation */}
      <ConfirmDialog
        open={showRegenerateConfirm}
        onOpenChange={setShowRegenerateConfirm}
        title="Regenerate Email Body?"
        description="This discards your manual edits and rebuilds the body from the selected template. This cannot be undone."
        confirmText="Regenerate"
        type="warning"
        onConfirm={() => setEditedBodyHtml(null)}
      />

      {/* Alert Dialog */}
      <AlertDialog
        open={alertDialog.open}
        onOpenChange={open => setAlertDialog({ ...alertDialog, open })}
        title={alertDialog.title}
        description={alertDialog.description}
        type={alertDialog.type}
        onConfirm={alertDialog.onConfirm}
        confirmText={alertDialog.confirmText}
        cancelText={alertDialog.cancelText}
        variant={alertDialog.variant}
      />
    </>
  );
}
