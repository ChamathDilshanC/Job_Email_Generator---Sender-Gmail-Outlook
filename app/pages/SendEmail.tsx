'use client';

import EmailSendingLoader from '@/app/components/EmailSendingLoader';
import { AlertDialog } from '@/components/alert-dialog';
import { FirebaseSignInButton } from '@/components/firebase-sign-in';
import JobFileUpload from '@/components/job-file-upload';
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
import { loadResumeData, ResumeData } from '@/lib/resumeDataService';
import { TEMPLATE_METADATA, TemplateType } from '@/lib/templateTypes';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';

export default function SendEmail() {
  const [formData, setFormData] = useState<EmailData>({
    companyName: '',
    position: '',
    recipientEmail: '',
  });

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
    handleSignOut,
    isLoading: authLoading,
  } = useAuth();

  // Load resume data and selected template on mount
  useEffect(() => {
    const fetchResumeData = async () => {
      setIsLoadingResume(true);
      try {
        const data = await loadResumeData();
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
  }, []);

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

  const handleEmailClientChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setEmailClient(e.target.value as 'gmail' | 'outlook');
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

  const handleSubmit = async (e: FormEvent) => {
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

    setIsSending(true);

    try {
      // Generate email using selected template and resume data
      let subject: string, bodyHtml: string, body: string;

      if (resumeData) {
        const jobDetails = {
          companyName: formData.companyName,
          position: formData.position,
          recipientEmail: formData.recipientEmail,
        };
        const generated = generateEmailFromTemplate(
          selectedTemplate,
          resumeData,
          jobDetails
        );
        subject = generated.subject;
        bodyHtml = generated.bodyHtml;
        body = generated.bodyText;
      } else {
        // Fallback to old template if no resume data
        const generated = generateEmail(formData);
        subject = generated.subject;
        bodyHtml = generated.bodyHtml;
        body = generated.body;
      }

      if (emailClient === 'outlook') {
        // For Outlook, use mailto: link (opens default email client)
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
          body + attachmentText
        )}`;

        window.location.href = mailtoLink;

        setAlertDialog({
          open: true,
          title: 'Opening Outlook...',
          description: `Your default email client is opening. Please attach your files manually if needed.`,
          type: 'info',
        });

        setIsSending(false);
        return;
      }

      // Gmail API sending (existing logic)
      // Check if user is authenticated for Gmail API
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

      // Send email via Gmail API
      const result = await sendEmailWithAttachments(
        {
          to: formData.recipientEmail,
          subject,
          body: bodyHtml,
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
        await saveEmailToHistory({
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
          emailPreview: body.substring(0, 200) + '...',
        });

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

  const handleCopyEmail = async () => {
    let subject: string, body: string;

    if (resumeData) {
      const jobDetails = {
        companyName: formData.companyName,
        position: formData.position,
        recipientEmail: formData.recipientEmail,
      };
      const generated = generateEmailFromTemplate(
        selectedTemplate,
        resumeData,
        jobDetails
      );
      subject = generated.subject;
      body = generated.bodyText;
    } else {
      const generated = generateEmail(formData);
      subject = generated.subject;
      body = generated.body;
    }

    const fullEmail = `Subject: ${subject}\n\n${body}`;

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

  // Send button should only be enabled when form is valid AND files are uploaded
  const canSendEmail = isFormValid && isFileUploadValid();

  // Generate email preview
  const generatedEmail = isFormValid
    ? resumeData
      ? generateEmailFromTemplate(selectedTemplate, resumeData, {
          companyName: formData.companyName,
          position: formData.position,
          recipientEmail: formData.recipientEmail,
        })
      : generateEmail(formData)
    : null;

  return (
    <>
      {/* Loading Animation */}
      {isSending && <EmailSendingLoader message="Sending your email..." />}

      <div className="page-header animate-fade-in">
        <h1 className="page-title">Services</h1>
        <p className="page-description">
          Create professional job application emails
        </p>
      </div>

      <div className="card animate-fade-in">
        <div className="card-header">
          <h2 className="card-title">Application Details</h2>
          <div className="flex items-center gap-3">
            {isAuthenticated && userEmail ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-gray-200 shadow-sm">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
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
                  <span className="text-sm font-medium text-gray-700">
                    {userEmail}
                  </span>
                </div>
                <button
                  className="btn btn-secondary btn-icon"
                  onClick={handleSignOutClick}
                  title="Sign Out"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <FirebaseSignInButton
                  onSuccess={() => {
                    console.log('✨ Sign-in success - refreshing page');
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
              </div>
            )}
            <button
              className="btn btn-secondary btn-icon"
              onClick={handleCopyEmail}
              disabled={!isFormValid}
              title="Copy Email"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              {copySuccess && (
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  Copied!
                </span>
              )}
            </button>
            <button
              className={`btn btn-primary ${
                !canSendEmail ? 'opacity-50 cursor-pointer' : ''
              }`}
              onClick={handleSubmit}
              disabled={isSending}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              {isSending
                ? 'Sending...'
                : emailClient === 'gmail'
                ? 'Send via Gmail'
                : 'Send via Outlook'}
            </button>
          </div>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Field Name</th>
                <th>Value</th>
                <th>Email Client</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>Company Name</strong>
                </td>
                <td>
                  <input
                    type="text"
                    name="companyName"
                    className="form-input"
                    placeholder="e.g., Google, Microsoft"
                    value={formData.companyName}
                    onChange={handleInputChange}
                  />
                </td>
                <td>
                  <select
                    className="form-select"
                    value={emailClient}
                    onChange={handleEmailClientChange}
                    style={{ minWidth: '120px' }}
                  >
                    <option value="gmail">Gmail</option>
                    <option value="outlook">Outlook</option>
                  </select>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="btn-icon edit"
                      onClick={handleEditCompany}
                      title="Edit company name"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      className="btn-icon delete"
                      onClick={handleDeleteCompany}
                      title="Clear company name"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Position</strong>
                </td>
                <td>
                  <input
                    type="text"
                    name="position"
                    className="form-input"
                    placeholder="e.g., Full Stack Developer"
                    value={formData.position}
                    onChange={handleInputChange}
                  />
                </td>
                <td>
                  <span className="badge">Required</span>
                </td>
                <td></td>
              </tr>
              <tr>
                <td>
                  <strong>Email Template</strong>
                </td>
                <td>
                  <select
                    className="form-select"
                    value={selectedTemplate}
                    onChange={e =>
                      setSelectedTemplate(
                        parseInt(e.target.value) as TemplateType
                      )
                    }
                    style={{ minWidth: '200px' }}
                    disabled={!resumeData}
                  >
                    {TEMPLATE_METADATA.map(template => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                  {!resumeData && (
                    <p className="text-xs text-yellow-600 mt-1">
                      Complete Resume Builder to use templates
                    </p>
                  )}
                </td>
                <td>
                  <span
                    className="badge"
                    style={{
                      backgroundColor: '#fee2e2',
                      color: '#dc2626',
                      fontWeight: '600',
                    }}
                  >
                    Check Your Selected Template Correct.
                  </span>
                </td>
                <td></td>
              </tr>
              <tr>
                <td>
                  <strong>Recipient Email</strong>
                </td>
                <td>
                  <input
                    type="email"
                    name="recipientEmail"
                    className="form-input"
                    placeholder="e.g., hr@company.com"
                    value={formData.recipientEmail}
                    onChange={handleInputChange}
                  />
                </td>
                <td>
                  <span className="badge">Required</span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}></div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Cover Letter Requirement Toggle */}
        <div
          style={{
            marginTop: '2rem',
            padding: '0 1rem',
            paddingBottom: '0.5rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '1rem',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
            }}
          >
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                cursor: 'pointer',
                fontSize: '0.95rem',
                fontWeight: '500',
                color: '#333',
              }}
            >
              <input
                type="checkbox"
                checked={requireCoverLetter}
                onChange={e => setRequireCoverLetter(e.target.checked)}
                style={{
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer',
                }}
              />
              <span>Require Cover Letter</span>
            </label>
            <span
              style={{
                fontSize: '0.85rem',
                color: '#666',
                fontStyle: 'italic',
              }}
            >
              {requireCoverLetter
                ? '✓ Cover letter is required'
                : 'Cover letter is optional'}
            </span>
          </div>
        </div>

        {/* File Upload Sections */}
        <div
          style={{
            marginTop: '1rem',
            padding: '0 1rem',
            paddingBottom: '1rem',
          }}
        >
          <JobFileUpload onFilesChange={setAttachments} />

          {/* Upload Status Indicators */}
          <div
            style={{
              marginTop: '1rem',
              padding: '0.75rem',
              backgroundColor: '#f0f7ff',
              borderRadius: '6px',
              border: '1px solid #d0e7ff',
            }}
          >
            <div
              style={{
                fontSize: '0.9rem',
                fontWeight: '600',
                marginBottom: '0.5rem',
                color: '#1a5490',
              }}
            >
              Upload Requirements:
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.85rem',
                }}
              >
                {attachments.cv ? (
                  <span style={{ color: '#22c55e', fontWeight: '600' }}>✓</span>
                ) : (
                  <span style={{ color: '#ef4444', fontWeight: '600' }}>✗</span>
                )}
                <span style={{ color: attachments.cv ? '#22c55e' : '#ef4444' }}>
                  CV{' '}
                  {attachments.cv ? `(${attachments.cv.name})` : '(Required)'}
                </span>
              </div>
              {requireCoverLetter && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.85rem',
                  }}
                >
                  {attachments.coverLetter ? (
                    <span style={{ color: '#22c55e', fontWeight: '600' }}>
                      ✓
                    </span>
                  ) : (
                    <span style={{ color: '#ef4444', fontWeight: '600' }}>
                      ✗
                    </span>
                  )}
                  <span
                    style={{
                      color: attachments.coverLetter ? '#22c55e' : '#ef4444',
                    }}
                  >
                    Cover Letter{' '}
                    {attachments.coverLetter
                      ? `(${attachments.coverLetter.name})`
                      : '(Required)'}
                  </span>
                </div>
              )}
            </div>
            {!canSendEmail && isFormValid && (
              <div
                style={{
                  marginTop: '0.75rem',
                  padding: '0.5rem',
                  backgroundColor: '#fef3c7',
                  borderRadius: '4px',
                  fontSize: '0.85rem',
                  color: '#92400e',
                }}
              >
                ⚠️ Please upload all required files to enable the send button
              </div>
            )}
          </div>
        </div>

        {/* Email Preview */}
        {isFormValid && generatedEmail && (
          <div className="email-preview animate-fade-in">
            <div className="email-field">
              <span className="field-label">To:</span>
              <span className="field-value">{formData.recipientEmail}</span>
            </div>
            <div className="email-field">
              <span className="field-label">Subject:</span>
              <span className="field-value">{generatedEmail.subject}</span>
            </div>
            <div className="email-body">
              <pre>
                {'bodyText' in generatedEmail
                  ? generatedEmail.bodyText
                  : generatedEmail.body}
              </pre>
            </div>
          </div>
        )}
      </div>

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
