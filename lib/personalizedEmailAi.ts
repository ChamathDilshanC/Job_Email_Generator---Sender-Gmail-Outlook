import { ApiError, FinishReason, GoogleGenAI, ThinkingLevel } from '@google/genai';
import type { ResumeData } from '@/lib/resumeDataService';

let client: GoogleGenAI | null = null;
const MODELS = ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3.1-flash-lite'];

function getClient() {
  if (!client) {
    if (!process.env.GEMINI_API_KEY) throw new Error('AI generation is not configured.');
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return client;
}

export async function generatePersonalizedEmail(
  resume: ResumeData,
  input: {
    companyName: string;
    position: string;
    jobDescription: string;
    tone: string;
    length: string;
    additionalInstructions?: string;
  }
): Promise<{ subject: string; body: string }> {
  const prompt = `Create a personalized job application email using only facts in the applicant resume.
Never invent skills, employers, dates, degrees, projects, achievements, metrics, or qualifications. A requirement in the job description is not evidence the applicant has that skill. Omit unsupported claims.
Return only valid JSON with exactly two string fields: subject and body. Do not use markdown or HTML.
The body should be natural, concise, and ready to send, with a greeting, 2-4 short paragraphs, and a professional closing. Avoid generic filler and avoid starting with "I am writing to express my strong interest".
Tone: ${input.tone}. Length: ${input.length}.

APPLICANT RESUME:
${JSON.stringify({
    personalInfo: resume.personalInfo,
    skills: resume.skills,
    workExperiences: resume.workExperiences,
    education: resume.education,
    projects: resume.projects,
  })}

JOB:
Company: ${input.companyName}
Position: ${input.position}
Description: ${input.jobDescription}

ADDITIONAL INSTRUCTIONS:
${input.additionalInstructions || 'None'}`;

  let lastError: unknown;
  for (const model of MODELS) {
    try {
      const response = await getClient().models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseJsonSchema: {
            type: 'object',
            required: ['subject', 'body'],
            properties: { subject: { type: 'string' }, body: { type: 'string' } },
          },
          thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
          temperature: 0.3,
          maxOutputTokens: 1400,
        },
      });
      if (response.promptFeedback?.blockReason || response.candidates?.[0]?.finishReason !== FinishReason.STOP) {
        throw new Error('The AI could not generate this email.');
      }
      const result = JSON.parse(response.text || '{}') as { subject?: string; body?: string };
      if (!result.subject?.trim() || !result.body?.trim()) throw new Error('The AI returned an empty email.');
      return { subject: result.subject.trim(), body: result.body.trim() };
    } catch (error) {
      lastError = error;
      if (!(error instanceof ApiError) || ![429, 500, 503].includes(error.status)) throw error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error('The AI is temporarily unavailable.');
}
