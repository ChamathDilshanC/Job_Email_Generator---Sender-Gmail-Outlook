import clientPromise from '@/lib/mongodb';
import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

const MAX_TEXT = 30000;
const collectionName = 'cover_letters';

function serialize(doc: Record<string, unknown>) {
  return { ...doc, id: String(doc._id), _id: undefined };
}

export async function GET(request: NextRequest) {
  try {
    const params = new URL(request.url).searchParams;
    const userId = params.get('userId');
    if (!userId) return NextResponse.json({ error: 'User ID required.' }, { status: 401 });
    const client = await clientPromise;
    const filter: Record<string, unknown> = { userId };
    const query = params.get('query')?.trim();
    if (query) filter.$or = [{ companyName: { $regex: query, $options: 'i' } }, { position: { $regex: query, $options: 'i' } }];
    const docs = await client.db('job_email_generator').collection(collectionName).find(filter).sort({ updatedAt: -1 }).limit(100).toArray();
    return NextResponse.json({ coverLetters: docs.map(serialize) });
  } catch (error) {
    console.error('Error loading cover letters:', error);
    return NextResponse.json({ error: 'Failed to load cover letters.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, profileId, companyName, position, jobDescription, content } = body;
    if (!userId || !profileId || !companyName?.trim() || !position?.trim() || !jobDescription?.trim() || !content?.trim()) {
      return NextResponse.json({ error: 'Incomplete cover letter.' }, { status: 400 });
    }
    if (jobDescription.length > MAX_TEXT || content.length > MAX_TEXT) return NextResponse.json({ error: 'Cover letter is too large.' }, { status: 400 });
    const client = await clientPromise;
    const db = client.db('job_email_generator');
    const collection = db.collection<Record<string, unknown> & { _id: string }>(collectionName);
    const now = new Date();
    const id = body.id || randomUUID();
    const existing = await collection.findOne({ _id: id, userId });
    const document = {
      userId, profileId, profileName: body.profileName || '',
      companyName: companyName.trim(), position: position.trim(),
      jobUrl: body.jobUrl?.trim() || '', jobDescription: jobDescription.trim(),
      length: body.length, tone: body.tone, additionalInstructions: body.additionalInstructions?.trim() || '',
      hiringManagerName: body.hiringManagerName?.trim() || '',
      hiringManagerTitle: body.hiringManagerTitle?.trim() || '',
      companyAddress: body.companyAddress?.trim() || '',
      includeContactHeader: body.includeContactHeader !== false,
      template: body.template || 'minimal',
      content: content.trim(), updatedAt: now,
      ...(existing ? {} : { _id: id, createdAt: now }),
    };
    await collection.updateOne({ _id: id, userId }, { $set: document }, { upsert: true });
    const saved = await collection.findOne({ _id: id, userId });
    return NextResponse.json({ coverLetter: saved ? serialize(saved) : null });
  } catch (error) {
    console.error('Error saving cover letter:', error);
    return NextResponse.json({ error: 'Failed to save cover letter.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const params = new URL(request.url).searchParams;
    const userId = params.get('userId');
    const id = params.get('id');
    if (!userId || !id) return NextResponse.json({ error: 'User ID and cover letter ID required.' }, { status: 400 });
    const client = await clientPromise;
    const result = await client.db('job_email_generator').collection<Record<string, unknown> & { _id: string }>(collectionName).deleteOne({ _id: id, userId });
    return result.deletedCount ? NextResponse.json({ success: true }) : NextResponse.json({ error: 'Cover letter not found.' }, { status: 404 });
  } catch (error) {
    console.error('Error deleting cover letter:', error);
    return NextResponse.json({ error: 'Failed to delete cover letter.' }, { status: 500 });
  }
}
