import { generatePersonalizedEmail } from '@/lib/personalizedEmailAi';
import clientPromise from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, profileId, companyName, position, jobDescription, tone, length } = body;
    if (!userId || !profileId || !companyName?.trim() || !position?.trim() || !jobDescription?.trim()) {
      return NextResponse.json({ error: 'Resume, company, position, and job description are required.' }, { status: 400 });
    }
    if (jobDescription.length > 30000) return NextResponse.json({ error: 'Job description is too long.' }, { status: 400 });
    const client = await clientPromise;
    const resume = await client.db('job_email_generator').collection('resumes').findOne({ userId, profileId });
    if (!resume) return NextResponse.json({ error: 'Resume profile not found.' }, { status: 404 });
    const result = await generatePersonalizedEmail(resume as never, body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error generating personalized email:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to generate email.' }, { status: 500 });
  }
}
