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
}

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
  },
  {
    id: TemplateType.SKILLS_HIGHLIGHT,
    name: 'Skills Highlight',
    subject: 'Skilled {Position} Ready to Contribute - {Your Name}',
    preview: 'Focus on specific technical skills and competencies',
    description:
      'Emphasizes technical expertise and specific skill sets relevant to the position',
  },
  {
    id: TemplateType.EXPERIENCE_FOCUSED,
    name: 'Experience-Focused',
    subject: 'Experienced {Position} Seeking New Opportunity - {Your Name}',
    preview: 'Emphasizes professional experience and career achievements',
    description:
      'Best for candidates with significant work history and accomplishments',
  },
  {
    id: TemplateType.PROJECT_SHOWCASE,
    name: 'Project Showcase',
    subject: 'Application for {Position} - Portfolio Included',
    preview: 'Highlights specific projects and tangible results',
    description:
      'Perfect for showcasing concrete work examples and project outcomes',
  },
  {
    id: TemplateType.CAREER_TRANSITION,
    name: 'Career Transition',
    subject: 'Transitioning Professional Applying for {Position}',
    preview: 'Addresses career change while highlighting transferable skills',
    description:
      'Ideal for career changers emphasizing transferable skills and motivation',
  },
  {
    id: TemplateType.COMPREHENSIVE_PROFILE,
    name: 'Comprehensive Profile',
    subject: 'Application for {Position} - {Your Name}',
    preview: 'Complete professional profile with all sections',
    description:
      'Detailed template showcasing skills, experience, projects, and education',
  },
  {
    id: TemplateType.COLD_OUTREACH,
    name: 'Cold Outreach to Recruiter',
    subject: 'Interested in Opportunities at {Company} - {Your Name}',
    preview:
      'A concise, confident introduction sent directly to a recruiter or hiring manager',
    description:
      'Best for proactively reaching out before (or without) a matching open posting',
  },
  {
    id: TemplateType.REFERRAL_APPLICATION,
    name: 'Referral Application',
    subject: 'Referred by {Referral Name} for {Position} - {Your Name}',
    preview:
      'Leads with the referral connection to build instant credibility',
    description:
      'Ideal when a current employee or contact has referred you for a role',
  },
  {
    id: TemplateType.INTERVIEW_THANK_YOU,
    name: 'Interview Thank You',
    subject: 'Thank You - {Position} Interview',
    preview:
      'A warm, timely thank-you note reinforcing your fit right after an interview',
    description:
      'Send within 24 hours of an interview to reinforce enthusiasm and fit',
  },
  {
    id: TemplateType.FOLLOW_UP_CHECK_IN,
    name: 'Application Follow-Up',
    subject: 'Following Up: {Position} Application - {Your Name}',
    preview:
      'A polite check-in after applying with no response, without being pushy',
    description:
      'Use one to two weeks after applying when you have not heard back yet',
  },
  {
    id: TemplateType.NETWORKING_INFORMATIONAL,
    name: 'Networking Request',
    subject: 'Quick Question About {Company} - {Your Name}',
    preview:
      'Requests a short informational chat rather than a job opening',
    description:
      'For reaching out to professionals at a company you admire to learn more',
  },
  {
    id: TemplateType.OFFER_RESPONSE,
    name: 'Offer Response',
    subject: 'Re: Offer for {Position} at {Company}',
    preview:
      'A gracious acceptance or decline letter that keeps the relationship warm',
    description:
      'Use once you have decided whether to accept or decline a job offer',
  },
];
