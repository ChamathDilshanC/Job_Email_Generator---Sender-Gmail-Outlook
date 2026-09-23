import { ApiError, FinishReason, GoogleGenAI, ThinkingLevel } from '@google/genai';
import type { ResumeData } from '@/lib/resumeDataService';
import { getLengthGuidance, stripLeadingGreeting, type CoverLetterLength, type CoverLetterTone } from '@/lib/coverLetter';

const MODELS = ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3.1-flash-lite'];
let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (!client) {
    if (!process.env.GEMINI_API_KEY) throw new Error('AI generation is not configured.');
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return client;
}

function compactResume(resume: ResumeData) {
  return {
    personalInfo: resume.personalInfo,
    socialLinks: resume.socialLinks,
    skills: resume.skills,
    workExperiences: resume.workExperiences,
    education: resume.education,
    projects: resume.projects,
  };
}

export async function generateCoverLetter(
  resume: ResumeData,
  input: {
    companyName: string;
    position: string;
    jobDescription: string;
    length: CoverLetterLength;
    tone: CoverLetterTone;
    additionalInstructions?: string;
    hiringManagerName?: string;
    hiringManagerTitle?: string;
    companyAddress?: string;
  }
): Promise<string> {
  const systemInstruction = `You are an expert career-writing assistant creating an ATS-friendly professional cover letter.
Use ONLY factual information in the supplied applicant resume. Never invent companies, titles, dates, skills, degrees, certifications, metrics, awards, projects, or achievements. A skill in the job description is not evidence that the applicant has it. If a fact is unavailable, omit it.
Connect relevant real experience to the supplied job description. Avoid generic filler and the phrase "I am writing to express my strong interest". Keep the writing natural, human, and professional. Do not include a greeting/salutation such as "Dear Hiring Manager,"; the application template adds exactly one greeting. Do not include a subject line, UI labels, markdown, or fabricated contact information.
ATS REQUIREMENTS: Use plain text only with standard paragraph structure. Do not use tables, columns, text boxes, emojis, icons, decorative symbols, unusual characters, keyword stuffing, or headings such as "Cover Letter". Naturally mirror relevant job-description keywords only when they are supported by the resume. Prioritize specific role terminology, readable sentences, and clear evidence over visual styling.
${getLengthGuidance(input.length)} Count the words in your final response before returning it. The requested length is a hard requirement, not a suggestion. Keep the complete letter suitable for one A4 page; use compact paragraphs and never add filler to force a second page. Use only the resume as the source of applicant facts; use the job description only to understand the employer's needs and role context. Use a ${input.tone} tone. Return only the letter body with paragraphs separated by blank lines.`;

  const userPrompt = [
    'APPLICANT RESUME (SOURCE OF TRUTH):',
    JSON.stringify(compactResume(resume)),
    '',
    'TARGET JOB:',
    `Company: ${input.companyName}`,
    `Position: ${input.position}`,
    `Hiring manager: ${input.hiringManagerName || 'Unknown; use Dear Hiring Manager'}`,
    `Hiring manager title: ${input.hiringManagerTitle || ''}`,
    `Company address: ${input.companyAddress || ''}`,
    'JOB DESCRIPTION (OPTIONAL CONTEXT ONLY - NOT A SOURCE OF APPLICANT FACTS):',
    input.jobDescription || 'No job description was provided. Tailor the letter using the company, position, and relevant resume facts only.',
    '',
    `Additional instructions (follow only when factually supported): ${input.additionalInstructions || 'None'}`,
  ].join('\n');

  let lastError: unknown;
  for (const model of MODELS) {
    try {
      const response = await getClient().models.generateContent({
        model,
        contents: userPrompt,
        config: {
          systemInstruction,
          thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
          temperature: 0.35,
          maxOutputTokens: 1800,
        },
      });
      if (response.promptFeedback?.blockReason || response.candidates?.[0]?.finishReason !== FinishReason.STOP) {
        throw new Error('The AI could not generate this cover letter.');
      }
      const text = response.text?.trim();
      if (!text) throw new Error('The AI returned an empty cover letter.');
      return stripLeadingGreeting(text);
    } catch (error) {
      lastError = error;
      if (!(error instanceof ApiError) || ![429, 500, 503].includes(error.status)) throw error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error('The AI is temporarily unavailable.');
}
