'use client';

import EmailSendingLoader from '@/app/components/EmailSendingLoader';
import SendPreviewModal from '@/app/components/SendPreviewModal';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { GoogleSignInButton } from '@/components/google-sign-in';
import JobFileUpload from '@/components/job-file-upload';
import type { PageType } from '@/components/sidebar-01/types';
import { RequiredStar } from '@/components/ui/required-star';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { copyToClipboard } from '@/lib/emailClient';
import { saveEmailToHistory } from '@/lib/emailHistoryService';
import { buildEmailPreview } from '@/lib/emailPreview';
import { generateEmail, type EmailData } from '@/lib/emailTemplate';
import { generateEmailFromTemplate } from '@/lib/emailTemplateGenerator';
import {
  base64ToFile,
  fileToBase64,
  sendEmailWithAttachments,
  type GmailAttachment,
} from '@/lib/gmailClient';
import { fadeInUp, staggerContainer } from '@/lib/motion';
import { getCachedData, setCachedData } from '@/lib/pageDataCache';
import {
  listResumeProfiles,
  loadResumeCvFile,
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
import { showToast } from '@/lib/toast';
import { loadFavoriteTemplateIds } from '@/lib/favoriteTemplates';
import type { CoverLetter } from '@/lib/coverLetter';
import { stripLeadingGreeting } from '@/lib/coverLetter';
import { jsPDF } from 'jspdf';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  Copy,
  FileText,
  Link2,
  LogOut,
  Mail,
  Paperclip,
  Pencil,
  Send,
  UserRound,
  WandSparkles,
  Trash2,
  XCircle,
  Sparkles,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import {
  ChangeEvent,
  FormEvent,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
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

// In-progress compose state, mirrored to localStorage so switching to
// another sidebar page (which unmounts this component entirely) and coming
// back doesn't lose what was typed. File attachments can't be serialized
// this way - the tagged CV re-attaches on its own via applyCvForProfile.
interface SendEmailDraft {
  formData: EmailData;
  additionalDetails: AdditionalDetails;
  showAdditionalDetails: boolean;
  emailClient: 'gmail' | 'outlook';
  requireCoverLetter: boolean;
  trackOpens: boolean;
  jobUrl: string;
  sendMode: 'now' | 'schedule';
  scheduledFor: string | null;
  editedBodyHtml: string | null;
  isEditingBody: boolean;
  emailGenerationMode: 'template' | 'ai';
  jobDescription: string;
  aiTone: string;
  aiLength: string;
  aiInstructions: string;
  coverLetterLength: CoverLetter['length'];
  coverLetterTone: CoverLetter['tone'];
  coverLetterInstructions: string;
}

function sendEmailDraftKey(uid?: string | null): string {
  return `sendEmailDraft:${uid || 'guest'}`;
}

const inMemorySendEmailDrafts = new Map<string, SendEmailDraft>();

interface SendEmailProps {
  onNavigate?: (page: PageType) => void;
}

function createCoverLetterPdfFile(
  letter: CoverLetter,
  resumeData: ResumeData | null,
  fallbackName: string
): File {
  const resumeName = resumeData?.personalInfo.fullName || fallbackName;
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
  const margin = 18;
  const pageWidth = 210;
  const contentWidth = pageWidth - margin * 2;
  const accent =
    letter.template === 'editorial'
      ? '#D71920'
      : letter.template === 'corporate'
        ? '#1555B5'
        : '#334155';

  pdf.setDrawColor(accent);
  pdf.setLineWidth(0.8);
  pdf.line(margin, 12, pageWidth - margin, 12);
  pdf.setTextColor('#172033');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.text(resumeName, margin, 24);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor('#526071');
  const contact = [
    resumeData?.personalInfo.email,
    resumeData?.personalInfo.phone,
    resumeData?.personalInfo.location,
  ]
    .filter(Boolean)
    .join(' · ');
  if (contact) pdf.text(contact, margin, 30);
  pdf.setTextColor(accent);
  pdf.setFont('helvetica', 'bold');
  pdf.text(letter.position, margin, contact ? 36 : 30);

  let y = contact ? 48 : 42;
  pdf.setTextColor('#172033');
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.text(
    new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    margin,
    y
  );
  y += 10;
  pdf.text(`Dear ${letter.hiringManagerName || 'Hiring Manager'},`, margin, y);
  y += 8;
  const paragraphs = stripLeadingGreeting(letter.content)
    .split(/\n\s*\n/)
    .filter(Boolean);
  for (const paragraph of paragraphs) {
    const lines = pdf.splitTextToSize(
      paragraph.replace(/\s+/g, ' ').trim(),
      contentWidth
    );
    pdf.text(lines, margin, y, { align: 'justify', maxWidth: contentWidth });
    y += lines.length * 4.5 + 4;
  }
  y += 3;
  pdf.text(['Sincerely,', resumeName], margin, y);

  const filename = `${(letter.name || `${letter.companyName}_${letter.position}`).replace(/[^\w.-]+/g, '_')}.pdf`;
  return new File([pdf.output('blob')], filename, { type: 'application/pdf' });
}

function Field({
  label,
  required,
  icon,
  action,
  hint,
  className = '',
  children,
}: {
  label: string;
  required?: boolean;
  icon?: ReactNode;
  action?: ReactNode;
  hint?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <div className="mb-1.5 flex min-h-6 items-center justify-between gap-2">
        <label className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          {icon}
          {label}
          {required && <RequiredStar />}
        </label>
        {action}
      </div>
      {children}
      {hint}
    </div>
  );
}

function ValidationMark({ complete }: { complete: boolean }) {
  return complete ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
      <CheckCircle2 className="h-3 w-3" /> Complete
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
      Required
    </span>
  );
}

function FlowStep({
  number,
  icon,
  title,
  description,
  active = false,
}: {
  number: string;
  icon: ReactNode;
  title: string;
  description: string;
  active?: boolean;
}) {
  return (
    <div className={`flex min-w-0 items-center gap-2.5 ${active ? 'text-foreground' : 'text-muted-foreground'}`}>
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${active ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background'}`}>
        {active ? icon : number}
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold">{title}</p>
        <p className="hidden truncate text-[11px] sm:block">{description}</p>
      </div>
    </div>
  );
}

function AiField({
  label,
  value,
  onChange,
  options,
  multiline = false,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options?: string[];
  multiline?: boolean;
  required?: boolean;
}) {
  const complete = !required || Boolean(value.trim());
  return (
    <label className="block text-xs font-medium text-muted-foreground">
      <span className="flex items-center justify-between gap-2">
        <span>{label}{required ? ' *' : ''}</span>
        {required && <ValidationMark complete={complete} />}
      </span>
      {options ? (
        <select aria-invalid={required && !complete} className={`form-select mt-1.5 ${required ? (complete ? 'border-emerald-400 bg-emerald-50/40 dark:border-emerald-700 dark:bg-emerald-950/20' : 'border-amber-300 dark:border-amber-700') : ''}`} value={value} onChange={e => onChange(e.target.value)}>
          {options.map(option => <option key={option} value={option}>{option[0].toUpperCase() + option.slice(1)}</option>)}
        </select>
      ) : multiline ? (
        <textarea aria-invalid={required && !complete} className={`form-textarea mt-1.5 min-h-[110px] w-full ${required ? (complete ? 'border-emerald-400 bg-emerald-50/40 dark:border-emerald-700 dark:bg-emerald-950/20' : 'border-amber-300 dark:border-amber-700') : ''}`} value={value} onChange={e => onChange(e.target.value)} />
      ) : (
        <input aria-invalid={required && !complete} className={`form-input mt-1.5 w-full ${required ? (complete ? 'border-emerald-400 bg-emerald-50/40 dark:border-emerald-700 dark:bg-emerald-950/20' : 'border-amber-300 dark:border-amber-700') : ''}`} value={value} onChange={e => onChange(e.target.value)} />
      )}
    </label>
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
  const [savedCoverLetters, setSavedCoverLetters] = useState<CoverLetter[]>([]);
  const [selectedSavedCoverLetter, setSelectedSavedCoverLetter] = useState('');
  const [cvSource, setCvSource] = useState<'profile' | 'devresume'>('profile');
  const [devResumeUpdatedAt, setDevResumeUpdatedAt] = useState<string | null>(null);
  const [isLoadingDevResume, setIsLoadingDevResume] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [requireCoverLetter, setRequireCoverLetter] = useState(false);
  const [coverLetterLength, setCoverLetterLength] =
    useState<CoverLetter['length']>('standard');
  const [coverLetterTone, setCoverLetterTone] =
    useState<CoverLetter['tone']>('professional');
  const [coverLetterInstructions, setCoverLetterInstructions] = useState('');
  const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] = useState(false);
  // On by default per user preference - knowing whether a recruiter opened
  // the email is worth more here than the small deliverability risk from
  // the tracking pixel. Still user-toggleable per send.
  const [trackOpens, setTrackOpens] = useState(true);

  // Template selection and resume data
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>(
    TemplateType.PROFESSIONAL_INTRO
  );
  const [emailGenerationMode, setEmailGenerationMode] = useState<'template' | 'ai'>('template');
  const [jobDescription, setJobDescription] = useState('');
  const [aiTone, setAiTone] = useState('professional');
  const [aiLength, setAiLength] = useState('standard');
  const [aiInstructions, setAiInstructions] = useState('');
  const [aiGeneratedEmail, setAiGeneratedEmail] = useState<{ subject: string; bodyHtml: string; body: string } | null>(null);
  const [isGeneratingAiEmail, setIsGeneratingAiEmail] = useState(false);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [isLoadingResume, setIsLoadingResume] = useState(false);
  const [resumeProfiles, setResumeProfiles] = useState<ResumeProfileSummary[]>(
    []
  );
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [isCvAutoLoaded, setIsCvAutoLoaded] = useState(false);

  // Auto-fill from job URL
  const [jobUrl, setJobUrl] = useState('');
  const [isParsingJobUrl, setIsParsingJobUrl] = useState(false);

  // Rich text body editing + preview-before-send
  const [editedBodyHtml, setEditedBodyHtml] = useState<string | null>(null);
  const [isEditingBody, setIsEditingBody] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);
  const emailBodySectionRef = useRef<HTMLDivElement>(null);

  // Send now vs schedule for later (Gmail only)
  const [sendMode, setSendMode] = useState<'now' | 'schedule'>('now');
  const [scheduledFor, setScheduledFor] = useState<Date | null>(null);

  // Sign-out confirmation (the only real yes/no confirmation on this page —
  // everything else is a toast notification)
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  // Use Auth Context
  const {
    isAuthenticated,
    accessToken,
    userEmail,
    user,
    handleSignOut,
    isLoading: authLoading,
  } = useAuth();

  // Restore an in-progress draft (if any) once, on mount.
  const draftRestoredRef = useRef(false);
  useEffect(() => {
    if (draftRestoredRef.current) return;
    draftRestoredRef.current = true;

    const draft = inMemorySendEmailDrafts.get(sendEmailDraftKey(user?.uid));
    if (!draft) return;

    setFormData(draft.formData);
    setAdditionalDetails(draft.additionalDetails);
    setShowAdditionalDetails(draft.showAdditionalDetails);
    setEmailClient(draft.emailClient);
    setRequireCoverLetter(draft.requireCoverLetter);
    setTrackOpens(draft.trackOpens);
    setJobUrl(draft.jobUrl);
    setSendMode(draft.sendMode);
    setScheduledFor(draft.scheduledFor ? new Date(draft.scheduledFor) : null);
    setEditedBodyHtml(draft.editedBodyHtml);
    setIsEditingBody(draft.isEditingBody);
    setEmailGenerationMode(draft.emailGenerationMode);
    setJobDescription(draft.jobDescription);
    setAiTone(draft.aiTone);
    setAiLength(draft.aiLength);
    setAiInstructions(draft.aiInstructions);
    setCoverLetterLength(draft.coverLetterLength || 'standard');
    setCoverLetterTone(draft.coverLetterTone || 'professional');
    setCoverLetterInstructions(draft.coverLetterInstructions || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  // Keep the draft in memory so sidebar navigation preserves it, while a full
  // browser refresh starts with a clean compose form.
  useEffect(() => {
    if (!draftRestoredRef.current) return;
    inMemorySendEmailDrafts.set(sendEmailDraftKey(user?.uid), {
      formData,
      additionalDetails,
      showAdditionalDetails,
      emailClient,
      requireCoverLetter,
      trackOpens,
      jobUrl,
      sendMode,
      scheduledFor: scheduledFor ? scheduledFor.toISOString() : null,
      editedBodyHtml,
      isEditingBody,
      emailGenerationMode,
      jobDescription,
      aiTone,
      aiLength,
      aiInstructions,
      coverLetterLength,
      coverLetterTone,
      coverLetterInstructions,
    });
  }, [
    formData,
    additionalDetails,
    showAdditionalDetails,
    emailClient,
    requireCoverLetter,
    trackOpens,
    jobUrl,
    sendMode,
    scheduledFor,
    editedBodyHtml,
    isEditingBody,
    emailGenerationMode,
    jobDescription,
    aiTone,
    aiLength,
    aiInstructions,
    coverLetterLength,
    coverLetterTone,
    coverLetterInstructions,
    user?.uid,
  ]);

  useEffect(() => {
    if (!user?.uid) return;
    fetch(`/api/cover-letter?userId=${encodeURIComponent(user.uid)}`)
      .then(response => response.ok ? response.json() : Promise.reject(new Error('Could not load cover letters')))
      .then(data => setSavedCoverLetters(data.coverLetters || []))
      .catch(() => setSavedCoverLetters([]));
  }, [user?.uid]);

  const attachSavedCoverLetter = (id: string) => {
    setSelectedSavedCoverLetter(id);
    const letter = savedCoverLetters.find(item => item.id === id);
    if (!letter) {
      setAttachments(previous => ({ ...previous, coverLetter: null }));
      return;
    }
    setAttachments(previous => ({
      ...previous,
      coverLetter: createCoverLetterPdfFile(
        letter,
        resumeData,
        user?.displayName || 'Applicant'
      ),
    }));
    showToast('success', 'Cover letter PDF attached', `${letter.name || letter.companyName} is ready to send.`);
  };

  const loadDevResume = async () => {
    if (!user?.uid) return;
    setIsLoadingDevResume(true);
    try {
      const response = await fetch(`/api/integrations/devresume/resume?userId=${encodeURIComponent(user.uid)}`, { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok || !data.resume?.data) throw new Error(data.error || 'DevResume resume is unavailable.');
      setAttachments(previous => ({
        ...previous,
        cv: base64ToFile(data.resume.data, data.resume.fileName, data.resume.mimeType),
      }));
      setIsCvAutoLoaded(false);
      setDevResumeUpdatedAt(data.resume.lastModified || null);
      showToast('success', 'DevResume resume loaded', data.resume.lastModified ? `Updated ${new Date(data.resume.lastModified).toLocaleString()}` : undefined);
    } catch (error) {
      showToast('error', 'Could not load DevResume resume', error instanceof Error ? error.message : undefined);
    } finally {
      setIsLoadingDevResume(false);
    }
  };

  // Load the CV file tagged to a resume profile (if any) and drop it
  // straight into the attachment slot, so picking a profile is enough to
  // attach its resume — no manual upload needed unless the user wants to
  // override it for this particular send.
  const applyCvForProfile = async (profileId: string) => {
    if (!user?.uid || !profileId) return;
    try {
      const cv = await loadResumeCvFile(user.uid, profileId);
      if (cv && 'data' in cv && cv.data) {
        const file = base64ToFile(cv.data, cv.fileName, cv.mimeType);
        setAttachments(prev => ({ ...prev, cv: file }));
        setIsCvAutoLoaded(true);
      } else {
        setAttachments(prev => ({ ...prev, cv: null }));
        setIsCvAutoLoaded(false);
      }
    } catch (error) {
      console.error('Error auto-loading resume CV file:', error);
    }
  };

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

      const cacheKey = `send-email-resume:${user?.uid}`;
      const cached = getCachedData<{
        profiles: ResumeProfileSummary[];
        data: ResumeData | null;
      }>(cacheKey);
      if (cached) {
        const cachedProfileId =
          cached.profiles.find(p => p.isDefault)?.profileId ||
          cached.profiles[0]?.profileId ||
          '';
        setResumeProfiles(cached.profiles);
        setSelectedProfileId(cachedProfileId);
        setResumeData(cached.data);
        setIsLoadingResume(false);
        if (cachedProfileId) applyCvForProfile(cachedProfileId);
      } else {
        setIsLoadingResume(true);
      }

      try {
        // The default profile's data can be resolved server-side without
        // knowing its id first, so fetch the list and the data in parallel
        // instead of waiting on the list before requesting the data.
        const [profiles, data] = await Promise.all([
          listResumeProfiles(user?.uid),
          loadResumeData(user?.uid),
        ]);
        setResumeProfiles(profiles);
        const defaultProfileId =
          profiles.find(p => p.isDefault)?.profileId || profiles[0]?.profileId;
        setSelectedProfileId(defaultProfileId || '');
        setResumeData(data);
        setCachedData(cacheKey, { profiles, data });
        if (defaultProfileId) applyCvForProfile(defaultProfileId);
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
      await applyCvForProfile(profileId);
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
        showToast(
          'warning',
          "Couldn't Auto-fill",
          data.error ||
            "We couldn't detect the company/position from that page. LinkedIn's login-walled listings often block this — please fill the fields in manually."
        );
        return;
      }

      setFormData(prev => ({
        ...prev,
        companyName: data.companyName || prev.companyName,
        position: data.position || prev.position,
      }));

      showToast(
        'success',
        'Auto-filled',
        'Company/position were filled in from the job posting — double check them before sending.'
      );
    } catch (error) {
      console.error('Error auto-filling from job URL:', error);
      showToast(
        'error',
        'Error',
        'Failed to read that job URL. Please fill the fields in manually.'
      );
    } finally {
      setIsParsingJobUrl(false);
    }
  };

  const handleGenerateAiEmail = async () => {
    if (!user?.uid || !selectedProfileId || !resumeData || !formData.companyName || !formData.position || !jobDescription.trim()) {
      showToast('warning', 'Missing Information', 'Add a resume, company, position, and job description first.');
      return;
    }
    setIsGeneratingAiEmail(true);
    try {
      const response = await fetch('/api/email/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          profileId: selectedProfileId,
          companyName: formData.companyName,
          position: formData.position,
          jobDescription,
          tone: aiTone,
          length: aiLength,
          additionalInstructions: aiInstructions,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not generate email.');
      const bodyHtml = result.body
        .split(/\n\s*\n/)
        .map((paragraph: string) => `<p>${paragraph.replace(/[&<>"']/g, (char: string) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] || char)}</p>`)
        .join('');
      setAiGeneratedEmail({ subject: result.subject, bodyHtml, body: result.body });
      setEditedBodyHtml(null);
      showToast('success', 'AI email generated', 'Review the email and edit it before sending.');
    } catch (error) {
      showToast('error', 'AI generation failed', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setIsGeneratingAiEmail(false);
    }
  };

  // Show alert when page loads if user is not signed in
  useEffect(() => {
    // Wait for auth to finish loading
    if (!authLoading && !isAuthenticated) {
      showToast(
        'warning',
        'Sign In Required',
        'Please sign in with Google to send emails via Gmail and use all features. You can still use Outlook without signing in.'
      );
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
    setShowSignOutConfirm(true);
  };

  // Validate the form, then open the preview modal instead of sending
  // immediately — the actual send happens from the modal's confirm action.
  const generateRequiredCoverLetter = async (): Promise<boolean> => {
    if (!requireCoverLetter) return true;
    if (!user?.uid || !selectedProfileId || !resumeData) {
      showToast(
        'warning',
        'Resume Profile Required',
        'Select a completed resume profile before generating the required cover letter.'
      );
      return false;
    }

    setIsGeneratingCoverLetter(true);
    try {
      const generationResponse = await fetch('/api/cover-letter/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          profileId: selectedProfileId,
          companyName: formData.companyName,
          position: formData.position,
          jobDescription,
          length: coverLetterLength,
          tone: coverLetterTone,
          additionalInstructions: coverLetterInstructions,
        }),
      });
      const generationData = await generationResponse.json();
      if (!generationResponse.ok) {
        throw new Error(generationData.error || 'Could not generate cover letter.');
      }

      const saveResponse = await fetch('/api/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          profileId: selectedProfileId,
          profileName: resumeProfiles.find(
            profile => profile.profileId === selectedProfileId
          )?.profileName,
          name: `${formData.companyName.trim()} - ${formData.position.trim()}`,
          companyName: formData.companyName,
          position: formData.position,
          jobDescription,
          length: coverLetterLength,
          tone: coverLetterTone,
          additionalInstructions: coverLetterInstructions,
          content: stripLeadingGreeting(generationData.content || ''),
        }),
      });
      const saveData = await saveResponse.json();
      if (!saveResponse.ok || !saveData.coverLetter) {
        throw new Error(saveData.error || 'Could not save cover letter.');
      }

      const letter = saveData.coverLetter as CoverLetter;
      setSavedCoverLetters(previous => [
        letter,
        ...previous.filter(item => item.id !== letter.id),
      ]);
      setSelectedSavedCoverLetter(letter.id);
      setAttachments(previous => ({
        ...previous,
        coverLetter: createCoverLetterPdfFile(
          letter,
          resumeData,
          user.displayName || 'Applicant'
        ),
      }));
      showToast(
        'success',
        'Cover Letter Ready',
        `A tailored PDF for ${formData.companyName.trim()} was saved and attached.`
      );
      return true;
    } catch (error) {
      showToast(
        'error',
        'Could Not Prepare Cover Letter',
        error instanceof Error ? error.message : 'Please try again.'
      );
      return false;
    } finally {
      setIsGeneratingCoverLetter(false);
    }
  };

  const handleOpenPreview = async (e: FormEvent) => {
    e.preventDefault();

    if (
      !formData.companyName ||
      !formData.position ||
      !formData.recipientEmail
    ) {
      showToast(
        'warning',
        'Missing Information',
        'Please fill in all required fields: Company Name, Position, and Recipient Email.'
      );
      return;
    }

    const coverLetterReady = await generateRequiredCoverLetter();
    if (!coverLetterReady) return;

    // Check if files are uploaded
    if (!isFileUploadValid(coverLetterReady)) {
      showToast(
        'warning',
        'Missing Files',
        'Please upload your CV ' +
          (requireCoverLetter ? 'and Cover Letter ' : '') +
          'before sending.'
      );
      return;
    }

    // Check if user is authenticated for Gmail API
    if (!isAuthenticated || !accessToken) {
      showToast(
        'warning',
        'Authentication Required',
        'Please sign in with Google to send emails with attachments.'
      );
      return;
    }

    if (
      sendMode === 'schedule' &&
      (!scheduledFor || scheduledFor.getTime() <= Date.now())
    ) {
      showToast(
        'warning',
        'Pick a Future Date & Time',
        'Please choose when this email should be sent — it must be in the future.'
      );
      return;
    }

    setShowPreviewModal(true);
  };

  // Called when the user clicks "Edit" inside the Preview modal — closes the
  // modal (handled by the modal itself) and drops the main page straight
  // into the Email Body edit mode so they can make changes.
  const handleEditFromPreview = () => {
    setIsEditingBody(true);
    setTimeout(() => {
      emailBodySectionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 150);
  };

  const handleConfirmSend = async () => {
    if (!generatedEmail) return;

    const subject = generatedEmail.subject;
    const plainTextFallback =
      'bodyText' in generatedEmail
        ? generatedEmail.bodyText
        : generatedEmail.body;

    // Close the preview so the sending animation (rendered in the page
    // behind it) is actually visible instead of sitting under the dialog.
    setShowPreviewModal(false);
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

        showToast(
          'info',
          'Opening Outlook...',
          'Your default email client is opening. Please attach your files manually if needed.'
        );

        setIsSending(false);
        return;
      }

      // Gmail API sending
      if (!isAuthenticated || !accessToken) {
        showToast(
          'warning',
          'Authentication Required',
          'Please sign in with Google to send emails via Gmail.'
        );
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

      // Embed a hidden open-tracking pixel, but only if the user opted in —
      // it's a well-known spam-filter signal, and only possible for Gmail
      // sends anyway (Outlook's mailto: hands off to the user's own mail
      // client, which we never see again).
      const trackingId = trackOpens ? crypto.randomUUID() : undefined;
      const bodyWithTracking = trackingId
        ? `${displayedBodyHtml}<img src="${window.location.origin}/api/track/${trackingId}" width="1" height="1" style="display:none" alt="" />`
        : displayedBodyHtml;

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
          // Snapshot what was actually sent (including any manual edits), not
          // the originally generated template body.
          emailPreview:
            buildEmailPreview(displayedBodyHtml) ||
            buildEmailPreview(plainTextFallback),
          emailBodyHtml: displayedBodyHtml,
          trackingId,
        });

        // The draft is now safely sent - nothing left to protect against a
        // tab switch, so drop it instead of resurrecting a "sent" email.
        inMemorySendEmailDrafts.delete(sendEmailDraftKey(user?.uid));

        showToast(
          'success',
          'Email Sent Successfully!',
          `Your email has been sent via Gmail to ${formData.recipientEmail}.${attachmentText}`
        );
      } else {
        // Check if it's an authentication error
        if ((result as any).authError) {
          // Sign out the user to clear expired token
          await handleSignOut();

          showToast(
            'warning',
            'Authentication Expired',
            'Your session has expired. Please sign in again to send emails.'
          );
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

      showToast(
        isAuthError ? 'warning' : 'error',
        isAuthError ? 'Authentication Expired' : 'Failed to Send Email',
        isAuthError
          ? 'Your session has expired. Please sign in again to send emails.'
          : errorMessage
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleConfirmSchedule = async () => {
    if (!generatedEmail || !scheduledFor || !user?.uid) return;

    // Close the preview so the sending animation (rendered in the page
    // behind it) is actually visible instead of sitting under the dialog.
    setShowPreviewModal(false);
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
        trackOpens,
        templateId: selectedTemplate,
        templateName,
      });

      if (result.success) {
        // The draft is now safely scheduled server-side - nothing left to
        // protect against a tab switch.
        inMemorySendEmailDrafts.delete(sendEmailDraftKey(user?.uid));

        showToast(
          'success',
          'Email Scheduled!',
          `This email will be sent to ${formData.recipientEmail} on ${scheduledFor.toLocaleString()}. Manage it from the Scheduled page.`
        );
        setSendMode('now');
        setScheduledFor(null);
      } else {
        throw new Error(result.error || 'Failed to schedule email');
      }
    } catch (error) {
      console.error('Error scheduling email:', error);
      showToast(
        'error',
        'Failed to Schedule Email',
        error instanceof Error ? error.message : 'An unknown error occurred'
      );
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

  const handleClearDetails = () => {
    setFormData({ companyName: '', position: '', recipientEmail: '' });
    setAdditionalDetails(EMPTY_ADDITIONAL_DETAILS);
    setShowAdditionalDetails(false);
    setJobUrl('');
    setJobDescription('');
    setAiInstructions('');
    setAiGeneratedEmail(null);
    setEditedBodyHtml(null);
    setIsEditingBody(false);
    setEmailGenerationMode('template');
    setSendMode('now');
    setScheduledFor(null);
    setRequireCoverLetter(false);
    setAttachments(previous => ({ ...previous, coverLetter: null }));
    inMemorySendEmailDrafts.delete(sendEmailDraftKey(user?.uid));
    showToast('success', 'Details cleared', 'Your application details are ready for a new email.');
  };

  const isFormValid =
    formData.companyName && formData.position && formData.recipientEmail;
  const hasCompany = Boolean(formData.companyName.trim());
  const hasPosition = Boolean(formData.position.trim());
  const hasRecipient = Boolean(formData.recipientEmail.trim());
  const hasAiJobDescription = emailGenerationMode !== 'ai' || Boolean(jobDescription.trim());

  // Check if file upload requirements are met
  const isFileUploadValid = (coverLetterReady = false) => {
    // CV is always required
    if (!attachments.cv) {
      return false;
    }

    // If cover letter is required, check if it's uploaded
    if (requireCoverLetter && !attachments.coverLetter && !coverLetterReady) {
      return false;
    }

    return true;
  };

  // Send button should only be enabled when form is valid AND files are uploaded AND resume data exists
  const canSendEmail = isFormValid && hasAiJobDescription && isFileUploadValid() && !!resumeData;
  const favoriteTemplateIds = loadFavoriteTemplateIds(user?.uid);

  // Generate email preview
  const templateEmail = isFormValid
    ? resumeData
      ? generateEmailFromTemplate(selectedTemplate, resumeData, {
          companyName: formData.companyName,
          position: formData.position,
          recipientEmail: formData.recipientEmail,
          ...additionalDetails,
        })
      : generateEmail(formData)
    : null;
  const generatedEmail = emailGenerationMode === 'ai' && aiGeneratedEmail
    ? aiGeneratedEmail
    : templateEmail;

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
                    showToast(
                      'warning',
                      'Sign In Required',
                      'Please sign in with your Google account to access the Resume Builder.'
                    );
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
          className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
        >
          {/* macOS-style window titlebar */}
          <div className="relative flex items-center gap-1.5 border-b border-border bg-muted/40 px-5 py-3.5">
            <span className="h-3 w-3 rounded-full bg-red-400/80" />
            <span className="h-3 w-3 rounded-full bg-amber-400/80" />
            <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
            <span className="absolute left-1/2 -translate-x-1/2 text-xs font-medium text-muted-foreground">
              Send Application Email
            </span>
          </div>

          {/* Header */}
          <div className="flex flex-col gap-4 border-b border-border p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                  <Mail className="h-4 w-4" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">
                  Application Details
                </h2>
              </div>
              <p className="text-xs text-muted-foreground">
                Add the job details, personalize your message, and send when ready.
              </p>
            </div>
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
                    showToast('success', 'Signed In Successfully!', 'Refreshing page...');
                    setTimeout(() => {
                      window.location.reload();
                    }, 1000);
                  }}
                  onError={error => {
                    showToast('error', 'Sign In Failed', error);
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
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:hover:border-red-900 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                onClick={handleClearDetails}
                title="Clear application details"
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">Clear details</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: canSendEmail ? 1.03 : 1 }}
                whileTap={{ scale: canSendEmail ? 0.97 : 1 }}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={handleOpenPreview}
                disabled={isSending || isGeneratingCoverLetter}
              >
                <Send className="h-4 w-4" />
                {isGeneratingCoverLetter
                  ? 'Preparing Cover Letter...'
                  : isSending
                    ? 'Sending...'
                  : sendMode === 'schedule' && emailClient === 'gmail'
                    ? 'Review & Schedule'
                    : emailClient === 'gmail'
                      ? 'Review & Send via Gmail'
                      : 'Review & Send via Outlook'}
              </motion.button>
            </div>
          </div>

          <div className="border-b border-border bg-muted/20 px-6 py-4">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <FlowStep number="1" icon={<BriefcaseBusiness className="h-4 w-4" />} title="Job details" description="Company and role" active={Boolean(formData.companyName && formData.position)} />
              <FlowStep number="2" icon={<UserRound className="h-4 w-4" />} title="Recipient" description="Where to send" active={Boolean(formData.recipientEmail)} />
              <FlowStep number="3" icon={<WandSparkles className="h-4 w-4" />} title="Personalize" description="Template or AI" active={Boolean(resumeData)} />
              <FlowStep number="4" icon={<Send className="h-4 w-4" />} title="Review & send" description="Ready to deliver" active={Boolean(canSendEmail)} />
            </div>
          </div>

          {/* Auto-fill from Job URL */}
          <div className="mx-6 mt-6 rounded-xl border border-primary/15 bg-primary/[0.03] p-4">
            <div className="mb-2 flex items-center gap-2">
              <Link2 className="h-4 w-4 text-primary" />
              <label className="text-xs font-semibold text-foreground">
                Import a job posting <span className="font-normal text-muted-foreground">(optional)</span>
              </label>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="url"
                className="form-input flex-1 bg-background"
                placeholder="e.g., https://boards.greenhouse.io/company/jobs/12345"
                value={jobUrl}
                onChange={e => setJobUrl(e.target.value)}
              />
              <button
                type="button"
                onClick={handleAutoFillFromUrl}
                disabled={!jobUrl.trim() || isParsingJobUrl}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
              >
                <WandSparkles className="h-4 w-4" />
                {isParsingJobUrl ? 'Reading…' : 'Auto-fill details'}
              </button>
            </div>
            <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <FileText className="h-3.5 w-3.5 shrink-0" />
              Works best on Greenhouse/Lever/Workday and similar job boards.
              LinkedIn&apos;s login-walled listings may not auto-fill reliably.
            </p>
          </div>

          {/* Fields */}
          <div className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-2">
            <Field
              label="Company Name"
              required
              icon={<BriefcaseBusiness className="h-3.5 w-3.5 text-primary" />}
              action={
                <div className="flex items-center gap-1">
                  <ValidationMark complete={hasCompany} />
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
                aria-invalid={!hasCompany}
                className={`form-input ${hasCompany ? 'border-emerald-400 bg-emerald-50/40 pr-10 dark:border-emerald-700 dark:bg-emerald-950/20' : 'border-amber-300 dark:border-amber-700'}`}
                placeholder="e.g., Google, Microsoft"
                value={formData.companyName}
                onChange={handleInputChange}
              />
            </Field>

            <Field label="Position" required icon={<FileText className="h-3.5 w-3.5 text-primary" />} action={<ValidationMark complete={hasPosition} />}>
              <input
                type="text"
                name="position"
                aria-invalid={!hasPosition}
                className={`form-input ${hasPosition ? 'border-emerald-400 bg-emerald-50/40 dark:border-emerald-700 dark:bg-emerald-950/20' : 'border-amber-300 dark:border-amber-700'}`}
                placeholder="e.g., Full Stack Developer"
                value={formData.position}
                onChange={handleInputChange}
              />
            </Field>

            <Field label="Recipient Email" required icon={<Mail className="h-3.5 w-3.5 text-primary" />} action={<ValidationMark complete={hasRecipient} />}>
              <input
                type="email"
                name="recipientEmail"
                aria-invalid={!hasRecipient}
                className={`form-input ${hasRecipient ? 'border-emerald-400 bg-emerald-50/40 dark:border-emerald-700 dark:bg-emerald-950/20' : 'border-amber-300 dark:border-amber-700'}`}
                placeholder="e.g., hr@company.com"
                value={formData.recipientEmail}
                onChange={handleInputChange}
              />
            </Field>

            {resumeProfiles.length > 1 && (
              <Field label="Resume Profile" icon={<UserRound className="h-3.5 w-3.5 text-primary" />} action={<ValidationMark complete={Boolean(selectedProfileId && resumeData)} />}>
                <select
                  aria-invalid={!selectedProfileId || !resumeData}
                  className={`form-select ${selectedProfileId && resumeData ? 'border-emerald-400 bg-emerald-50/40 dark:border-emerald-700 dark:bg-emerald-950/20' : 'border-amber-300 dark:border-amber-700'}`}
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

            <Field label="Send Via" icon={<Send className="h-3.5 w-3.5 text-primary" />}>
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
              <Field label="When to Send" icon={<CalendarClock className="h-3.5 w-3.5 text-primary" />} className="sm:col-span-2">
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
              icon={<WandSparkles className="h-3.5 w-3.5 text-primary" />}
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
              <div className="mb-3 grid max-w-md grid-cols-2 rounded-xl border border-border bg-muted/30 p-1">
                <button type="button" onClick={() => setEmailGenerationMode('template')} className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${emailGenerationMode === 'template' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}><FileText className="h-4 w-4" />Template</button>
                <button type="button" onClick={() => setEmailGenerationMode('ai')} className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${emailGenerationMode === 'ai' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}><Sparkles className="h-4 w-4" />Generate with AI</button>
              </div>
              {emailGenerationMode === 'template' ? <select
                className="form-select"
                value={selectedTemplate}
                onChange={e => {
                  const next = parseInt(e.target.value) as TemplateType;
                  setSelectedTemplate(next);
                  // Shared with the Email Templates page's own selector, so
                  // whichever page you pick a template from wins on remount.
                  localStorage.setItem('selectedTemplateId', next.toString());
                }}
                disabled={!resumeData}
              >
                {favoriteTemplateIds.length > 0 && (
                  <optgroup label="♥ Favorites">
                    {favoriteTemplateIds.map(id => {
                      const template = TEMPLATE_METADATA.find(item => item.id === id);
                      return template ? (
                        <option key={`favorite-${template.id}`} value={template.id}>
                          ♥ {template.name}
                        </option>
                      ) : null;
                    })}
                  </optgroup>
                )}
                <optgroup label="All templates">
                {TEMPLATE_METADATA.filter(
                  template => !favoriteTemplateIds.includes(template.id)
                ).map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
                </optgroup>
              </select> : <div className="space-y-4 rounded-xl border border-primary/15 bg-primary/[0.03] p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary"><Sparkles className="h-4 w-4" /></div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Create a tailored email with AI</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">JobMail will use only facts from the selected resume profile.</p>
                  </div>
                </div>
                <div className={`rounded-lg ${jobDescription.trim() ? 'ring-1 ring-emerald-400' : 'ring-1 ring-amber-300'}`}>
                  <AiField label="Job Description" value={jobDescription} onChange={setJobDescription} multiline required />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <AiField label="Tone" value={aiTone} onChange={setAiTone} options={['professional', 'confident', 'friendly', 'concise', 'enthusiastic']} />
                  <AiField label="Length" value={aiLength} onChange={setAiLength} options={['short', 'standard', 'detailed']} />
                </div>
                <AiField label="Additional Instructions (optional)" value={aiInstructions} onChange={setAiInstructions} multiline />
                <button type="button" onClick={handleGenerateAiEmail} disabled={isGeneratingAiEmail || !jobDescription.trim()} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"><Sparkles />{isGeneratingAiEmail ? 'Generating...' : 'Generate with AI'}</button>
              </div>}
            </Field>
          </div>

          {/* Cover Letter Requirement Toggle */}
          <div className="mt-6 px-6">
            <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 p-4">
              <div>
                <label
                  htmlFor="require-cover-letter"
                  className="cursor-pointer text-[0.95rem] font-medium text-gray-800 dark:text-gray-200"
                >
                  Require Cover Letter
                </label>
                <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                  {requireCoverLetter
                    ? 'Cover letter is required before sending'
                    : 'Cover letter is optional'}
                </p>
              </div>
              <Switch
                id="require-cover-letter"
                checked={requireCoverLetter}
                onCheckedChange={setRequireCoverLetter}
                aria-label="Require Cover Letter"
              />
            </div>
            {requireCoverLetter && (
              <div className="mt-3 space-y-3 rounded-xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-900/60 dark:bg-amber-950/20">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Cover letter details
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Company and position come from this form. Choose the
                    builder options that are not available here.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    Length
                    <select
                      className="form-select mt-1.5 w-full"
                      value={coverLetterLength}
                      onChange={event =>
                        setCoverLetterLength(
                          event.target.value as CoverLetter['length']
                        )
                      }
                    >
                      <option value="short">Short (150-220 words)</option>
                      <option value="standard">Standard (250-350 words)</option>
                      <option value="detailed">Detailed (400-550 words)</option>
                    </select>
                  </label>
                  <label className="text-xs font-medium text-muted-foreground">
                    Tone
                    <select
                      className="form-select mt-1.5 w-full"
                      value={coverLetterTone}
                      onChange={event =>
                        setCoverLetterTone(
                          event.target.value as CoverLetter['tone']
                        )
                      }
                    >
                      <option value="professional">Professional</option>
                      <option value="confident">Confident</option>
                      <option value="friendly">Friendly</option>
                      <option value="concise">Concise</option>
                      <option value="enthusiastic">Enthusiastic</option>
                    </select>
                  </label>
                </div>
                <label className="block text-xs font-medium text-muted-foreground">
                  Additional instructions (optional)
                  <textarea
                    className="form-textarea mt-1.5 min-h-[80px] w-full"
                    value={coverLetterInstructions}
                    onChange={event =>
                      setCoverLetterInstructions(event.target.value)
                    }
                    placeholder="Mention a project, skill, or emphasis for this application..."
                    maxLength={2000}
                  />
                </label>
                <p className="text-xs text-muted-foreground">
                  The letter is generated and saved automatically when you
                  continue to preview.
                </p>
              </div>
            )}
            <div className="mt-3 rounded-xl border border-primary/20 bg-primary/[0.03] p-4">
              <div className="mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Attach a saved cover letter</p>
                  <p className="text-xs text-muted-foreground">Select one generated in Cover Letter Builder.</p>
                </div>
              </div>
              <select
                className="form-select w-full"
                value={selectedSavedCoverLetter}
                onChange={event => attachSavedCoverLetter(event.target.value)}
                aria-label="Select a saved cover letter"
              >
                <option value="">Choose a saved cover letter...</option>
                {savedCoverLetters.map(letter => (
                  <option key={letter.id} value={letter.id}>
                    {letter.name || `${letter.companyName} - ${letter.position}`} · {new Date(letter.updatedAt).toLocaleDateString()}
                  </option>
                ))}
              </select>
              {selectedSavedCoverLetter && attachments.coverLetter && (
                <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Saved cover letter selected
                </p>
              )}
            </div>
          </div>

          {/* Open Tracking Toggle */}
          <div className="mt-4 px-6">
            <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 p-4">
              <div>
                <label
                  htmlFor="track-opens"
                  className="cursor-pointer text-[0.95rem] font-medium text-gray-800 dark:text-gray-200"
                >
                  Track Email Opens
                </label>
                <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                  {trackOpens
                    ? 'A hidden pixel will record opens — this is a well-known spam-filter signal, so it may hurt inbox placement'
                    : 'Off — recommended for job applications, since landing in the inbox matters more than open tracking'}
                </p>
              </div>
              <Switch
                id="track-opens"
                checked={trackOpens}
                onCheckedChange={setTrackOpens}
                aria-label="Track Email Opens"
              />
            </div>
          </div>

          {/* Additional Details for scenario templates (cold outreach, referral,
              interview thank-you, follow-up, networking, offer response) */}
          <div className="mt-6 px-6">
            <button
              type="button"
              onClick={() => setShowAdditionalDetails(v => !v)}
              className="flex w-full items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-left text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              <span className="inline-flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <span>Additional Details{' '}
                <span className="font-normal text-muted-foreground">
                  (optional — for outreach, referral, interview &amp; offer
                  templates)
                </span>
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
          <div className="mt-6 px-6 pb-6">
            <div className="mb-4 rounded-xl border border-primary/20 bg-primary/[0.03] p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                <FileText className="h-4 w-4 text-primary" />
                CV / Resume source
              </div>
              <p className="mb-3 text-xs text-muted-foreground">
                Choose your saved JobMail CV or the latest CV from your connected DevResume Google Drive.
              </p>
              <select
                className="form-select"
                value={cvSource}
                onChange={event => {
                  const source = event.target.value as 'profile' | 'devresume';
                  setCvSource(source);
                  if (source === 'profile') {
                    setDevResumeUpdatedAt(null);
                    applyCvForProfile(selectedProfileId);
                  } else {
                    void loadDevResume();
                  }
                }}
              >
                <option value="profile">JobMail Resume Profile CV</option>
                <option value="devresume">DevResume Google Drive CV</option>
              </select>
              {cvSource === 'devresume' && (
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-md border border-primary/15 bg-background px-3 py-2 text-xs">
                  <span className="text-muted-foreground">
                    {devResumeUpdatedAt ? `Drive updated ${new Date(devResumeUpdatedAt).toLocaleString()}` : 'Latest Drive resume will be loaded for this email.'}
                  </span>
                  <button type="button" className="font-semibold text-primary hover:underline" onClick={() => void loadDevResume()} disabled={isLoadingDevResume}>
                    {isLoadingDevResume ? 'Loading...' : 'Refresh from Drive'}
                  </button>
                </div>
              )}
            </div>
            {isCvAutoLoaded && attachments.cv && (
              <p className="mb-3 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">
                  {attachments.cv.name}
                </span>{' '}
                was attached automatically from this Resume Profile. Upload a
                different file below only if you want to override it for this
                email.
              </p>
            )}
            <JobFileUpload
              onFilesChange={files => {
                // A manual change to the CV slot overrides whatever was
                // auto-loaded from the resume profile.
                if (files.cv !== attachments.cv) setIsCvAutoLoaded(false);
                setAttachments(files);
              }}
              onAlert={(title, description, type) => {
                showToast(type, title, description);
              }}
            />

            {/* Upload Status Indicators */}
            <div className={`mt-4 rounded-lg border p-4 ${isFileUploadValid() ? 'border-emerald-200 bg-emerald-50/60 dark:border-emerald-900/50 dark:bg-emerald-950/20' : 'border-blue-100 bg-[#f0f7ff] dark:border-[#818cf8]/25 dark:bg-[#818cf8]/10'}`}>
              <div className={`mb-2 flex items-center gap-2 text-sm font-semibold ${isFileUploadValid() ? 'text-emerald-700 dark:text-emerald-300' : 'text-[#1a5490] dark:text-[#a5b4fc]'}`}>
                {isFileUploadValid() ? <CheckCircle2 className="h-4 w-4" /> : <Paperclip className="h-4 w-4" />}
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
                  {isCvAutoLoaded && attachments.cv && (
                    <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">
                      Auto-loaded from Resume Profile
                    </span>
                  )}
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
              {isFileUploadValid() && (
                <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5" /> All required files are ready
                </p>
              )}
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

          {/* Email Body - real rendered preview by default; edit mode is opt-in */}
          <AnimatePresence>
            {isFormValid && generatedEmail && (
              <motion.div
                ref={emailBodySectionRef}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mx-6 mb-6 scroll-mt-6"
              >
                <div
                  className={`mb-4 rounded-2xl border p-4 shadow-sm ${
                    canSendEmail
                      ? 'border-emerald-200 bg-emerald-50/70 dark:border-emerald-900/60 dark:bg-emerald-950/20'
                      : 'border-amber-200 bg-amber-50/70 dark:border-amber-900/60 dark:bg-amber-950/20'
                  }`}
                  role="status"
                  aria-live="polite"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 rounded-full p-1.5 ${
                          canSendEmail
                            ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-300'
                        }`}
                      >
                        {canSendEmail ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <AlertTriangle className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">
                          {canSendEmail
                            ? 'Everything is ready to send'
                            : 'Complete the required details'}
                        </h3>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {canSendEmail
                            ? 'All required application details and files have been verified.'
                            : 'Review the items below before sending your application.'}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                        canSendEmail
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
                      }`}
                    >
                      {canSendEmail ? 'Verified' : 'Action needed'}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {[
                      { label: 'Company name', complete: hasCompany },
                      { label: 'Position', complete: hasPosition },
                      { label: 'Recipient email', complete: hasRecipient },
                      { label: 'Resume profile', complete: Boolean(resumeData) },
                      { label: 'CV attachment', complete: Boolean(attachments.cv) },
                      ...(requireCoverLetter
                        ? [
                            {
                              label: 'Cover letter attachment',
                              complete: Boolean(attachments.coverLetter),
                            },
                          ]
                        : []),
                      ...(emailGenerationMode === 'ai'
                        ? [
                            {
                              label: 'Job description',
                              complete: hasAiJobDescription,
                            },
                          ]
                        : []),
                    ].map(item => (
                      <div
                        key={item.label}
                        className={`flex items-center justify-between rounded-lg border px-3 py-2 text-xs ${
                          item.complete
                            ? 'border-emerald-200/80 bg-white/70 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-300'
                            : 'border-amber-200/80 bg-white/70 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300'
                        }`}
                      >
                        <span className="font-medium">{item.label}</span>
                        <span className="flex items-center gap-1 font-semibold">
                          {item.complete ? (
                            <>
                              <CheckCircle2 className="h-4 w-4" />
                              Done
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4" />
                              Required
                            </>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm dark:border-gray-800">
                <div className="flex items-center justify-between gap-2 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 px-5 py-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">
                      Email Body
                    </span>
                    {editedBodyHtml !== null && (
                      <span className="rounded-full bg-blue-100 dark:bg-[#818cf8]/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-700 dark:text-[#a5b4fc]">
                        Edited
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {isEditingBody && editedBodyHtml !== null && (
                      <button
                        type="button"
                        onClick={() => setShowRegenerateConfirm(true)}
                        className="text-xs font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                      >
                        Regenerate from template
                      </button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      type="button"
                      onClick={() => setIsEditingBody(v => !v)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                        isEditingBody
                          ? 'bg-primary text-primary-foreground'
                          : 'border border-border text-foreground hover:bg-accent'
                      }`}
                    >
                      {isEditingBody ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" /> Done Editing
                        </>
                      ) : (
                        <>
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
                <div className="space-y-2 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-5 py-4 text-sm">
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
                <div className="bg-white dark:bg-gray-900 p-5">
                  {isEditingBody ? (
                    <EmailBodyEditor
                      value={displayedBodyHtml}
                      onChange={html => setEditedBodyHtml(html)}
                    />
                  ) : (
                    <div
                      className="max-h-[420px] overflow-y-auto rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/30 p-4 text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: displayedBodyHtml }}
                    />
                  )}
                </div>
                {(attachments.cv || attachments.coverLetter) && (
                  <div className="flex items-center gap-1.5 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-5 py-2.5 text-xs text-muted-foreground">
                    <Paperclip className="h-3.5 w-3.5" />
                    {[attachments.cv?.name, attachments.coverLetter?.name]
                      .filter(Boolean)
                      .join(', ')}
                  </div>
                )}
                </div>
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
        onEdit={handleEditFromPreview}
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

      {/* Sign Out confirmation */}
      <ConfirmDialog
        open={showSignOutConfirm}
        onOpenChange={setShowSignOutConfirm}
        title="Sign Out"
        description="Are you sure you want to sign out?"
        confirmText="Sign Out"
        cancelText="Cancel"
        type="danger"
        onConfirm={() => {
          handleSignOut();
        }}
      />
    </>
  );
}
