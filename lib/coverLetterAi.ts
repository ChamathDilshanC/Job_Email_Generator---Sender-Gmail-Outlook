import { ApiError, FinishReason, GoogleGenAI, ThinkingLevel } from '@google/genai';
import type { ResumeData } from '@/lib/resumeDataService';
import { getLengthGuidance, type CoverLetterLength, type CoverLetterTone } from '@/lib/coverLetter';

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
  const systemInstruction = `You are an expert career-writing assistant creating a professional cover letter.
Use ONLY factual information in the supplied applicant resume. Never invent companies, titles, dates, skills, degrees, certifications, metrics, awards, projects, or achievements. A skill in the job description is not evidence that the applicant has it. If a fact is unavailable, omit it.
Connect relevant real experience to the supplied job description. Avoid generic filler and the phrase "I am writing to express my strong interest". Keep the writing natural, human, and professional. Do not include a subject line, UI labels, markdown, or fabricated contact information.
${getLengthGuidance(input.length)} Use a ${input.tone} tone. Return only the letter body with paragraphs separated by blank lines.`;

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
    `Job description: ${input.jobDescription}`,
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
      return text;
    } catch (error) {
      lastError = error;
      if (!(error instanceof ApiError) || ![429, 500, 503].includes(error.status)) throw error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error('The AI is temporarily unavailable.');
}
