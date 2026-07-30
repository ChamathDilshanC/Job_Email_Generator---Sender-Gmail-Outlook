import { FinishReason, GoogleGenAI } from '@google/genai';

// Server-only: reads a resume (PDF bytes or plain extracted text) and asks
// Gemini to pull it into the exact shape the Resume Builder wizard uses, so
// the parsed result can be dropped straight into component state with only
// client-side id generation left to do.

const MODEL = 'gemini-3.6-flash';

let client: GoogleGenAI | null = null;
function getClient(): GoogleGenAI {
  if (!client) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error(
        'GEMINI_API_KEY is not set — AI resume parsing is unavailable.'
      );
    }
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return client;
}

export interface ParsedWorkExperience {
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  currentlyWorking: boolean;
  description: string;
  responsibilities: string[];
}

export interface ParsedEducation {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  location: string;
  startDate: string;
  endDate: string;
  currentlyStudying: boolean;
  gpa: string;
  achievements: string[];
}

export interface ParsedProject {
  name: string;
  role: string;
  technologies: string[];
  startDate: string;
  endDate: string;
  currentlyWorking: boolean;
  description: string;
  keyFeatures: string[];
  projectUrl: string;
  githubUrl: string;
}

export interface ParsedResumeContent {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
  };
  socialLinks: {
    github: string;
    linkedin: string;
    portfolio: string;
    twitter: string;
    website: string;
    other: string;
  };
  workExperiences: ParsedWorkExperience[];
  education: ParsedEducation[];
  projects: ParsedProject[];
  skills: {
    position: string;
    selectedSkills: string[];
  };
}

const DATE_DESCRIPTION =
  "ISO date 'YYYY-MM-DD'. Use the 1st of the month when only month/year are known (e.g. '2022-03-01'). Empty string if unknown or currently ongoing.";

const workExperienceItemSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'company',
    'position',
    'location',
    'startDate',
    'endDate',
    'currentlyWorking',
    'description',
    'responsibilities',
  ],
  properties: {
    company: { type: 'string' },
    position: { type: 'string' },
    location: { type: 'string' },
    startDate: { type: 'string', description: DATE_DESCRIPTION },
    endDate: { type: 'string', description: DATE_DESCRIPTION },
    currentlyWorking: { type: 'boolean' },
    description: {
      type: 'string',
      description: 'Short 1-2 sentence overview of the role.',
    },
    responsibilities: {
      type: 'array',
      items: { type: 'string' },
      description: 'Bullet points of key duties/achievements in this role.',
    },
  },
};

const educationItemSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'institution',
    'degree',
    'fieldOfStudy',
    'location',
    'startDate',
    'endDate',
    'currentlyStudying',
    'gpa',
    'achievements',
  ],
  properties: {
    institution: { type: 'string' },
    degree: { type: 'string' },
    fieldOfStudy: { type: 'string' },
    location: { type: 'string' },
    startDate: { type: 'string', description: DATE_DESCRIPTION },
    endDate: { type: 'string', description: DATE_DESCRIPTION },
    currentlyStudying: { type: 'boolean' },
    gpa: { type: 'string', description: "GPA/grade if stated, else ''." },
    achievements: {
      type: 'array',
      items: { type: 'string' },
      description: 'Honors, awards, relevant coursework, etc.',
    },
  },
};

const projectItemSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'name',
    'role',
    'technologies',
    'startDate',
    'endDate',
    'currentlyWorking',
    'description',
    'keyFeatures',
    'projectUrl',
    'githubUrl',
  ],
  properties: {
    name: { type: 'string' },
    role: { type: 'string' },
    technologies: { type: 'array', items: { type: 'string' } },
    startDate: { type: 'string', description: DATE_DESCRIPTION },
    endDate: { type: 'string', description: DATE_DESCRIPTION },
    currentlyWorking: { type: 'boolean' },
    description: { type: 'string' },
    keyFeatures: { type: 'array', items: { type: 'string' } },
    projectUrl: { type: 'string' },
    githubUrl: { type: 'string' },
  },
};

const RESUME_EXTRACTION_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'personalInfo',
    'socialLinks',
    'workExperiences',
    'education',
    'projects',
    'skills',
  ],
  properties: {
    personalInfo: {
      type: 'object',
      additionalProperties: false,
      required: ['fullName', 'email', 'phone', 'location', 'summary'],
      properties: {
        fullName: { type: 'string' },
        email: { type: 'string' },
        phone: {
          type: 'string',
          description:
            "Phone number in international format starting with '+' if the country can be determined, otherwise the digits as written. Empty string if not present.",
        },
        location: {
          type: 'string',
          description: "City, Country (or City, State) if present.",
        },
        summary: {
          type: 'string',
          description:
            "2-4 sentence professional summary. If the resume has no explicit summary/objective, write a concise one from the rest of the content.",
        },
      },
    },
    socialLinks: {
      type: 'object',
      additionalProperties: false,
      required: ['github', 'linkedin', 'portfolio', 'twitter', 'website', 'other'],
      properties: {
        github: { type: 'string' },
        linkedin: { type: 'string' },
        portfolio: { type: 'string' },
        twitter: { type: 'string' },
        website: { type: 'string' },
        other: {
          type: 'string',
          description: 'Any other relevant link that does not fit the above.',
        },
      },
    },
    workExperiences: { type: 'array', items: workExperienceItemSchema },
    education: { type: 'array', items: educationItemSchema },
    projects: { type: 'array', items: projectItemSchema },
    skills: {
      type: 'object',
      additionalProperties: false,
      required: ['position', 'selectedSkills'],
      properties: {
        position: {
          type: 'string',
          description:
            'Target job title/position this resume is best suited for (inferred from most recent role or stated objective).',
        },
        selectedSkills: {
          type: 'array',
          items: { type: 'string' },
          description: 'Flat list of technical and professional skills found in the resume.',
        },
      },
    },
  },
};

const SYSTEM_PROMPT = `You extract structured resume data for a resume-builder app. Read the resume content provided and return only what the schema asks for — do not invent employers, dates, or skills that aren't supported by the text. Use empty strings/arrays for anything not present rather than guessing. Keep bullet points concise and close to the original wording.`;

type ContentPart = string | { inlineData: { mimeType: string; data: string } };

async function runExtraction(parts: ContentPart[]): Promise<ParsedResumeContent> {
  const response = await getClient().models.generateContent({
    model: MODEL,
    contents: parts,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: 'application/json',
      responseJsonSchema: RESUME_EXTRACTION_SCHEMA,
      thinkingConfig: { thinkingBudget: 0 },
      temperature: 0,
      maxOutputTokens: 8000,
    },
  });

  if (response.promptFeedback?.blockReason) {
    throw new Error(
      'The AI declined to process this resume. Please try a different file.'
    );
  }

  const finishReason = response.candidates?.[0]?.finishReason;
  if (finishReason && finishReason !== FinishReason.STOP) {
    throw new Error(
      'The AI declined to process this resume. Please try a different file.'
    );
  }

  const text = response.text;
  if (!text) {
    throw new Error('The AI did not return any extracted resume data.');
  }

  try {
    return JSON.parse(text) as ParsedResumeContent;
  } catch {
    throw new Error('The AI returned an unreadable response. Please try again.');
  }
}

export async function parseResumeFromPdf(
  base64Pdf: string
): Promise<ParsedResumeContent> {
  return runExtraction([
    { inlineData: { mimeType: 'application/pdf', data: base64Pdf } },
    'Extract this resume into the requested structured format.',
  ]);
}

export async function parseResumeFromText(
  resumeText: string
): Promise<ParsedResumeContent> {
  return runExtraction([
    `Extract the following resume text into the requested structured format:\n\n${resumeText}`,
  ]);
}
