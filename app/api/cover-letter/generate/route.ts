import clientPromise from '@/lib/mongodb';
import { generateCoverLetter } from '@/lib/coverLetterAi';
import type { CoverLetterLength, CoverLetterTone } from '@/lib/coverLetter';
import { NextRequest, NextResponse } from 'next/server';

const MAX_JOB_DESCRIPTION = 30000;
const lengths = new Set<CoverLetterLength>(['short', 'standard', 'detailed']);
const tones = new Set<CoverLetterTone>(['professional', 'confident', 'friendly', 'concise', 'enthusiastic']);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, profileId, companyName, position, jobDescription, length, tone } = body;
    if (!userId || !profileId || !companyName?.trim() || !position?.trim() || !jobDescription?.trim()) {
      return NextResponse.json({ error: 'Resume profile, company, position, and job description are required.' }, { status: 400 });
    }
    if (jobDescription.length > MAX_JOB_DESCRIPTION || !lengths.has(length) || !tones.has(tone)) {
      return NextResponse.json({ error: 'Invalid cover letter request.' }, { status: 400 });
    }
    const client = await clientPromise;
    const resume = await client.db('job_email_generator').collection('resumes').findOne({ userId, profileId });
    if (!resume) return NextResponse.json({ error: 'Resume profile not found.' }, { status: 404 });
    const content = await generateCoverLetter(resume as never, body);
    return NextResponse.json({ content });
  } catch (error) {
    console.error('Error generating cover letter:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to generate cover letter.' }, { status: 500 });
  }
}
