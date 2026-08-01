// Template Types and Shared Interfaces

export enum TemplateType {
  PROFESSIONAL_INTRO = 1,
  SKILLS_HIGHLIGHT = 2,
  EXPERIENCE_FOCUSED = 3,
  PROJECT_SHOWCASE = 4,
  CAREER_TRANSITION = 5,
  COMPREHENSIVE_PROFILE = 6,
  COLD_OUTREACH = 7,
  REFERRAL_APPLICATION = 8,
  INTERVIEW_THANK_YOU = 9,
  FOLLOW_UP_CHECK_IN = 10,
  NETWORKING_INFORMATIONAL = 11,
  OFFER_RESPONSE = 12,
  ENTRY_LEVEL_APPLICATION = 13,
  REMOTE_POSITION_APPLICATION = 14,
  PORTFOLIO_SUBMISSION = 15,
  INTERVIEW_AVAILABILITY = 16,
  INTERVIEW_RESCHEDULE = 17,
  POST_INTERVIEW_ADDITIONAL_INFO = 18,
  LINKEDIN_CONNECTION_FOLLOW_UP = 19,
  REFERRAL_REQUEST = 20,
  OFFER_NEGOTIATION = 21,
  ONBOARDING_CONFIRMATION = 22,
  ULTRA_MODERN_RECRUITER_SPOTLIGHT = 23,
  EXECUTIVE_PROJECT_PORTFOLIO = 24,
}

export enum TemplateCategory {
  APPLICATION = 'application',
  INTERVIEW_FOLLOW_UP = 'interview-follow-up',
  NETWORKING_REFERRAL = 'networking-referral',
  OFFER_ONBOARDING = 'offer-onboarding',
}

export const TEMPLATE_CATEGORY_LABELS: Record<TemplateCategory, string> = {
  [TemplateCategory.APPLICATION]: 'Application',
  [TemplateCategory.INTERVIEW_FOLLOW_UP]: 'Interview & Follow-Up',
  [TemplateCategory.NETWORKING_REFERRAL]: 'Networking & Referral',
  [TemplateCategory.OFFER_ONBOARDING]: 'Offer & Onboarding',
};

export interface JobDetails {
  companyName: string;
  position: string;
  recipientEmail: string;
  /** Optional context used by the outreach/follow-up/offer templates - safely
   *  ignored by templates that don't need them. */
  recruiterName?: string;
  referralName?: string;
  referralRole?: string;
  interviewerName?: string;
  interviewDate?: string;
  daysSinceApplied?: string;
  offerDeadline?: string;
  decision?: 'accept' | 'decline';
}

export interface GeneratedEmail {
  subject: string;
  bodyText: string;
  bodyHtml: string;
}

export interface TemplateMetadata {
  id: TemplateType;
  name: string;
  subject: string;
  preview: string;
  description: string;
  category: TemplateCategory;
  /** Shown as a "Recommended for Jobs" badge - reserved for the small set of
   *  templates best suited to a direct job application, not situational
   *  follow-ups/networking/offer notes. */
  recommended?: boolean;
}

export const TEMPLATE_METADATA: TemplateMetadata[] = [
  {
    id: TemplateType.PROFESSIONAL_INTRO,
    name: 'Professional Introduction',
    subject: 'Application for {Position} - {Your Name}',
    preview:
      'A formal introduction highlighting your interest and qualifications',
    description:
      'Classic professional approach with emphasis on qualifications and enthusiasm',
    category: TemplateCategory.APPLICATION,
    recommended: true,
  },
  {
    id: TemplateType.SKILLS_HIGHLIGHT,
    name: 'Skills Highlight',
    subject: 'Skilled {Position} Ready to Contribute - {Your Name}',
    preview: 'Focus on specific technical skills and competencies',
    description:
      'Emphasizes technical expertise and specific skill sets relevant to the position',
    category: TemplateCategory.APPLICATION,
    recommended: true,
  },
  {
    id: TemplateType.EXPERIENCE_FOCUSED,
    name: 'Experience-Focused',
    subject: 'Experienced {Position} Seeking New Opportunity - {Your Name}',
    preview: 'Emphasizes professional experience and career achievements',
    description:
      'Best for candidates with significant work history and accomplishments',
    category: TemplateCategory.APPLICATION,
    recommended: true,
  },
  {
    id: TemplateType.PROJECT_SHOWCASE,
    name: 'Project Showcase',
    subject: 'Application for {Position} - Portfolio Included',
    preview: 'Highlights specific projects and tangible results',
    description:
      'Perfect for showcasing concrete work examples and project outcomes',
    category: TemplateCategory.APPLICATION,
  },
  {
    id: TemplateType.CAREER_TRANSITION,
    name: 'Career Transition',
    subject: 'Transitioning Professional Applying for {Position}',
    preview: 'Addresses career change while highlighting transferable skills',
    description:
      'Ideal for career changers emphasizing transferable skills and motivation',
    category: TemplateCategory.APPLICATION,
  },
  {
    id: TemplateType.COMPREHENSIVE_PROFILE,
    name: 'Comprehensive Profile',
    subject: 'Application for {Position} - {Your Name}',
    preview: 'Complete professional profile with all sections',
    description:
      'Detailed template showcasing skills, experience, projects, and education',
    category: TemplateCategory.APPLICATION,
    recommended: true,
  },
  {
    id: TemplateType.ENTRY_LEVEL_APPLICATION,
    name: 'Entry-Level / Internship Application',
    subject: 'Application for {Position} - {Your Name}',
    preview:
      'Leads with education, coursework, and projects for candidates early in their career',
    description:
      'Best for students, new grads, and internship applicants with limited work history',
    category: TemplateCategory.APPLICATION,
    recommended: true,
  },
  {
    id: TemplateType.REMOTE_POSITION_APPLICATION,
    name: 'Remote Position Application',
    subject: 'Application for Remote {Position} - {Your Name}',
    preview:
      'Emphasizes remote-work readiness, async communication, and self-management',
    description:
      'Ideal when applying to a fully remote or distributed-team role',
    category: TemplateCategory.APPLICATION,
    recommended: true,
  },
  {
    id: TemplateType.PORTFOLIO_SUBMISSION,
    name: 'Portfolio & Work Samples',
    subject: 'Application for {Position} - Work Samples Included',
    preview:
      'Leads with a portfolio link and selected work samples for design/dev/creative roles',
    description:
      'Best when your projects speak louder than a bullet-point work history',
    category: TemplateCategory.APPLICATION,
  },
  {
    id: TemplateType.COLD_OUTREACH,
    name: 'Cold Outreach to Recruiter',
    subject: 'Interested in Opportunities at {Company} - {Your Name}',
    preview:
      'A concise, confident introduction sent directly to a recruiter or hiring manager',
    description:
      'Best for proactively reaching out before (or without) a matching open posting',
    category: TemplateCategory.NETWORKING_REFERRAL,
  },
  {
    id: TemplateType.REFERRAL_APPLICATION,
    name: 'Referral Application',
    subject: 'Referred by {Referral Name} for {Position} - {Your Name}',
    preview:
      'Leads with the referral connection to build instant credibility',
    description:
      'Ideal when a current employee or contact has referred you for a role',
    category: TemplateCategory.NETWORKING_REFERRAL,
  },
  {
    id: TemplateType.REFERRAL_REQUEST,
    name: 'Ask for a Referral',
    subject: 'Quick Favor - Referral for {Position} at {Company}',
    preview:
      'Directly asks a contact at the company to refer you for an open role',
    description:
      'Use before applying, when you have a contact but not yet a referral',
    category: TemplateCategory.NETWORKING_REFERRAL,
  },
  {
    id: TemplateType.NETWORKING_INFORMATIONAL,
    name: 'Networking Request',
    subject: 'Quick Question About {Company} - {Your Name}',
    preview:
      'Requests a short informational chat rather than a job opening',
    description:
      'For reaching out to professionals at a company you admire to learn more',
    category: TemplateCategory.NETWORKING_REFERRAL,
  },
  {
    id: TemplateType.LINKEDIN_CONNECTION_FOLLOW_UP,
    name: 'LinkedIn Connection Follow-Up',
    subject: 'Great Connecting - {Your Name}',
    preview:
      'A short, warm note opening a conversation after connecting on LinkedIn',
    description:
      'Send shortly after a recruiter or employee accepts your LinkedIn connection',
    category: TemplateCategory.NETWORKING_REFERRAL,
  },
  {
    id: TemplateType.INTERVIEW_THANK_YOU,
    name: 'Interview Thank You',
    subject: 'Thank You - {Position} Interview',
    preview:
      'A warm, timely thank-you note reinforcing your fit right after an interview',
    description:
      'Send within 24 hours of an interview to reinforce enthusiasm and fit',
    category: TemplateCategory.INTERVIEW_FOLLOW_UP,
  },
  {
    id: TemplateType.INTERVIEW_AVAILABILITY,
    name: 'Interview Availability & Confirmation',
    subject: 'Re: Interview for {Position} - {Your Name}',
    preview:
      'Confirms you can make a proposed interview time and checks logistics',
    description:
      'Reply to an interview invite to confirm the date, time, and format',
    category: TemplateCategory.INTERVIEW_FOLLOW_UP,
  },
  {
    id: TemplateType.INTERVIEW_RESCHEDULE,
    name: 'Interview Reschedule Request',
    subject: 'Rescheduling Request - {Position} Interview',
    preview:
      'Politely asks to move an interview time while keeping enthusiasm clear',
    description:
      'Use when a scheduling conflict means you need to propose a new time',
    category: TemplateCategory.INTERVIEW_FOLLOW_UP,
  },
  {
    id: TemplateType.POST_INTERVIEW_ADDITIONAL_INFO,
    name: 'Post-Interview Additional Information',
    subject: 'Following Up With Additional Information - {Position}',
    preview:
      'Sends extra materials or a fuller answer to something raised in the interview',
    description:
      'Use when you promised (or want) to follow up with more detail after interviewing',
    category: TemplateCategory.INTERVIEW_FOLLOW_UP,
  },
  {
    id: TemplateType.FOLLOW_UP_CHECK_IN,
    name: 'Application Follow-Up',
    subject: 'Following Up: {Position} Application - {Your Name}',
    preview:
      'A polite check-in after applying with no response, without being pushy',
    description:
      'Use one to two weeks after applying when you have not heard back yet',
    category: TemplateCategory.INTERVIEW_FOLLOW_UP,
  },
  {
    id: TemplateType.OFFER_RESPONSE,
    name: 'Offer Response',
    subject: 'Re: Offer for {Position} at {Company}',
    preview:
      'A gracious acceptance or decline letter that keeps the relationship warm',
    description:
      'Use once you have decided whether to accept or decline a job offer',
    category: TemplateCategory.OFFER_ONBOARDING,
  },
  {
    id: TemplateType.OFFER_NEGOTIATION,
    name: 'Offer Negotiation',
    subject: 'Re: Offer for {Position} at {Company} - A Quick Discussion',
    preview:
      'Requests a conversation about compensation or start date before accepting',
    description:
      'Use when you want to negotiate terms before formally accepting an offer',
    category: TemplateCategory.OFFER_ONBOARDING,
  },
  {
    id: TemplateType.ONBOARDING_CONFIRMATION,
    name: 'Onboarding & Start-Date Confirmation',
    subject: 'Confirming Start Date - {Your Name}',
    preview:
      'Confirms your start date and asks about onboarding steps after accepting',
    description:
      'Send after accepting an offer to confirm logistics before day one',
    category: TemplateCategory.OFFER_ONBOARDING,
  },
  {
    id: TemplateType.ULTRA_MODERN_RECRUITER_SPOTLIGHT,
    name: 'Ultra-Modern Recruiter Spotlight',
    subject: 'Application for {Position} - {Your Name}',
    preview:
      '30-second skimmable recruiter layout with nature-harmonized fonts, core metrics & GitHub project links',
    description:
      'Designed specifically for quick recruiter evaluation with skimmable highlights, tech pills & interactive project links',
    category: TemplateCategory.APPLICATION,
    recommended: true,
  },
  {
    id: TemplateType.EXECUTIVE_PROJECT_PORTFOLIO,
    name: 'Executive Project & Code Showcase',
    subject: 'Application for {Position} - Featured Projects & GitHub Included',
    preview:
      'High-impact showcase designed for senior engineering roles focusing on live project URLs & code repos',
    description:
      'Ultra modern project-centric presentation with tech stack breakdown, GitHub links, and live demos',
    category: TemplateCategory.APPLICATION,
    recommended: true,
  },
];
