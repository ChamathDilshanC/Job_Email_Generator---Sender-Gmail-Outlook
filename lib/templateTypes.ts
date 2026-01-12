// Template Types and Shared Interfaces

export enum TemplateType {
  PROFESSIONAL_INTRO = 1,
  SKILLS_HIGHLIGHT = 2,
  EXPERIENCE_FOCUSED = 3,
  PROJECT_SHOWCASE = 4,
  CAREER_TRANSITION = 5,
  COMPREHENSIVE_PROFILE = 6,
}

export interface JobDetails {
  companyName: string;
  position: string;
  recipientEmail: string;
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
];
