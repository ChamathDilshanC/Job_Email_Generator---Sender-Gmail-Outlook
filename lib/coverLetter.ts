export type CoverLetterLength = 'short' | 'standard' | 'detailed';
export type CoverLetterTone =
  | 'professional'
  | 'confident'
  | 'friendly'
  | 'concise'
  | 'enthusiastic';
export type CoverLetterTemplate = 'minimal' | 'corporate' | 'editorial';

export interface CoverLetter {
  id: string;
  profileId: string;
  profileName?: string;
  companyName: string;
  position: string;
  jobUrl?: string;
  jobDescription: string;
  length: CoverLetterLength;
  tone: CoverLetterTone;
  additionalInstructions?: string;
  hiringManagerName?: string;
  hiringManagerTitle?: string;
  companyAddress?: string;
  includeContactHeader: boolean;
  template: CoverLetterTemplate;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CoverLetterInput {
  userId: string;
  profileId: string;
  companyName: string;
  position: string;
  jobUrl?: string;
  jobDescription: string;
  length: CoverLetterLength;
  tone: CoverLetterTone;
  additionalInstructions?: string;
  hiringManagerName?: string;
  hiringManagerTitle?: string;
  companyAddress?: string;
  includeContactHeader?: boolean;
  template?: CoverLetterTemplate;
  content?: string;
}

export function getLengthGuidance(length: CoverLetterLength): string {
  return {
    short: 'Target approximately 150-220 words.',
    standard: 'Target approximately 250-350 words.',
    detailed: 'Target approximately 400-550 words.',
  }[length];
}

export function sanitizeDownloadName(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .slice(0, 80) || 'Cover_Letter';
}

export function getCoverLetterFilename(
  fullName: string | undefined,
  company: string,
  position: string,
  extension: 'pdf' | 'docx'
): string {
  return `${sanitizeDownloadName(fullName || 'Applicant')}_${sanitizeDownloadName(company)}_${sanitizeDownloadName(position)}_Cover_Letter.${extension}`;
}
