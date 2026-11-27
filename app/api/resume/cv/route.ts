import clientPromise from '@/lib/mongodb';
import { Collection } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';
import { getGoogleUser } from '@/lib/jobmailAuth';

// Tagged CV files are kept in their own collection, separate from the
// `resumes` collection that backs the wizard fields. Keeping the (large,
// base64) file blob out of that document means every normal resume-data
// load — which happens on nearly every page render — stays fast; only
// Send Email's "load the CV for this profile" path ever touches this data.

const MAX_BASE64_LENGTH = 7 * 1024 * 1024; // ~5MB raw

let indexesEnsured = false;
async function ensureIndexes(collection: Collection) {
  if (indexesEnsured) return;
  indexesEnsured = true;
  try {
    await collection.createIndex({ userId: 1, profileId: 1 }, { unique: true });
  } catch (error) {
    console.error('Error ensuring resume_cv_files index:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getGoogleUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { userId: requestedUserId, profileId, fileName, mimeType, data } = await request.json();

    if (requestedUserId && requestedUserId !== user.id) {
      return NextResponse.json({ error: 'You can only modify your own resume files.' }, { status: 403 });
    }
    const userId = user.id;
    if (!profileId || !fileName || !mimeType || !data) {
      return NextResponse.json(
        { error: 'userId, profileId, fileName, mimeType and data are required' },
        { status: 400 }
      );
    }

    if (typeof data !== 'string' || data.length > MAX_BASE64_LENGTH) {
      return NextResponse.json(
        { error: 'File is too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('job_email_generator');
    const collection = db.collection('resume_cv_files');
    await ensureIndexes(collection);

    const uploadedAt = new Date();
    await collection.updateOne(
      { userId, profileId },
      {
        $set: {
          userId,
          profileId,
          fileName,
          mimeType,
          data,
          size: Buffer.byteLength(data, 'base64'),
          uploadedAt,
        },
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      cvFile: { fileName, mimeType, size: Buffer.byteLength(data, 'base64'), uploadedAt },
    });
  } catch (error) {
    console.error('Error saving resume CV file:', error);
    return NextResponse.json(
      { error: 'Failed to save resume file' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getGoogleUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { searchParams } = new URL(request.url);
    const requestedUserId = searchParams.get('userId');
    const profileId = searchParams.get('profileId');
    const metaOnly = searchParams.get('meta') === 'true';

    if (requestedUserId && requestedUserId !== user.id) {
      return NextResponse.json({ error: 'You can only access your own resume files.' }, { status: 403 });
    }
    const userId = user.id;
    if (!profileId) {
      return NextResponse.json(
        { error: 'userId and profileId are required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('job_email_generator');
    const collection = db.collection('resume_cv_files');

    const doc = await collection.findOne(
      { userId, profileId },
      { projection: metaOnly ? { data: 0 } : undefined }
    );

    if (!doc) {
      return NextResponse.json({ cvFile: null });
    }

    return NextResponse.json({
      cvFile: {
        fileName: doc.fileName,
        mimeType: doc.mimeType,
        size: doc.size,
        uploadedAt: doc.uploadedAt,
        ...(metaOnly ? {} : { data: doc.data }),
      },
    });
  } catch (error) {
    console.error('Error loading resume CV file:', error);
    return NextResponse.json(
      { error: 'Failed to load resume file' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getGoogleUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { searchParams } = new URL(request.url);
    const requestedUserId = searchParams.get('userId');
    const profileId = searchParams.get('profileId');

    if (requestedUserId && requestedUserId !== user.id) {
      return NextResponse.json({ error: 'You can only delete your own resume files.' }, { status: 403 });
    }
    const userId = user.id;
    if (!profileId) {
      return NextResponse.json(
        { error: 'userId and profileId are required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('job_email_generator');
    const collection = db.collection('resume_cv_files');

    await collection.deleteOne({ userId, profileId });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting resume CV file:', error);
    return NextResponse.json(
      { error: 'Failed to delete resume file' },
      { status: 500 }
    );
  }
}
