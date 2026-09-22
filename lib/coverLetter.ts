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
  name?: string;
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
    short: 'MANDATORY LENGTH: 150-220 words for the letter body. Use 3 concise paragraphs and do not exceed 220 words.',
    standard: 'MANDATORY LENGTH: 250-350 words for the letter body. Use 4 balanced paragraphs and do not fall below 250 words.',
    detailed: 'MANDATORY LENGTH: 400-550 words for the letter body. Use 5-6 developed paragraphs and do not fall below 400 words.',
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
