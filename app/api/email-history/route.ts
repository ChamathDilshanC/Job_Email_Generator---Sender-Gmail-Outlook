import { ApplicationStatus } from '@/app/models/EmailHistory';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';

let indexesEnsured = false;
async function ensureIndexes(collection: import('mongodb').Collection) {
  if (indexesEnsured) return;
  indexesEnsured = true;
  try {
    await Promise.all([
      collection.createIndex({ userId: 1, sentDate: -1 }),
      collection.createIndex({ userId: 1, applicationStatus: 1 }),
      collection.createIndex({ userId: 1, status: 1 }),
      collection.createIndex({ trackingId: 1 }),
    ]);
  } catch (error) {
    console.error('Error ensuring email_history indexes:', error);
  }
}

// GET: Fetch email history for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const statsOnly = searchParams.get('stats') === 'true';
    const bodyForId = searchParams.get('bodyFor');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('job_email_generator');
    const collection = db.collection('email_history');
    await ensureIndexes(collection);

    if (bodyForId) {
      // The full HTML body is only fetched when a single email is opened, so
      // the list request doesn't carry 50 rendered emails over the wire.
      if (!ObjectId.isValid(bodyForId)) {
        return NextResponse.json({ error: 'Invalid email ID' }, { status: 400 });
      }
      const doc = await collection.findOne(
        { _id: new ObjectId(bodyForId), userId },
        { projection: { emailBodyHtml: 1 } }
      );
      if (!doc) {
        return NextResponse.json({ error: 'Email not found' }, { status: 404 });
      }
      return NextResponse.json({ emailBodyHtml: doc.emailBodyHtml || '' });
    }

    if (statsOnly) {
      // Just three counts — avoid pulling every full history doc (incl.
      // statusHistory arrays and email previews) over the wire just to
      // tally them client-side.
      const [total, sent, pending] = await Promise.all([
        collection.countDocuments({ userId }),
        collection.countDocuments({ userId, status: 'sent' }),
        collection.countDocuments({ userId, status: 'pending' }),
      ]);
      return NextResponse.json({ stats: { total, sent, pending } });
    }

    const history = await collection
      .find({ userId }, { projection: { emailBodyHtml: 0 } })
      .sort({ sentDate: -1 }) // Newest first
      .skip(offset)
      .limit(limit)
      .toArray();

    // Which rows have a stored HTML body worth fetching on open. Cheap to
    // answer separately; far cheaper than shipping every body in the list.
    const idsWithBody = new Set(
      history.length === 0
        ? []
        : (
            await collection
              .find(
                {
                  userId,
                  emailBodyHtml: { $exists: true, $nin: [null, ''] },
                  _id: { $in: history.map(doc => doc._id) },
                },
                { projection: { _id: 1 } }
              )
              .toArray()
          ).map(doc => doc._id.toString())
    );

    // Transform _id to id for frontend compatibility
    const transformedHistory = history.map(doc => ({
      ...doc,
      id: doc._id.toString(),
      _id: undefined, // Remove _id from the response
      // A sent email always has an application in flight; pending/failed
      // rows have no application yet, so leave their stage unset.
      applicationStatus:
        doc.applicationStatus ?? (doc.status === 'sent' ? 'applied' : undefined),
      hasBodyHtml: idsWithBody.has(doc._id.toString()),
    }));

    return NextResponse.json({ history: transformedHistory });
  } catch (error) {
    console.error('Error loading email history:', error);
    return NextResponse.json(
      { error: 'Failed to load email history' },
      { status: 500 }
    );
  }
}

// POST: Save new email to history
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, ...emailData } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('job_email_generator');
    const collection = db.collection('email_history');

    const result = await collection.insertOne({
      ...emailData,
      userId,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: 'Email saved to history',
      id: result.insertedId,
    });
  } catch (error) {
    console.error('Error saving email to history:', error);
    return NextResponse.json(
      { error: 'Failed to save email to history' },
      { status: 500 }
    );
  }
}

const VALID_APPLICATION_STATUSES: ApplicationStatus[] = [
  'applied',
  'interview_scheduled',
  'rejected',
  'offered',
  'no_response',
];

// PATCH: Update the application pipeline stage for a history entry
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const emailId = searchParams.get('emailId');
    const body = await request.json();
    const { applicationStatus, note } = body as {
      applicationStatus?: ApplicationStatus;
      note?: string;
    };

    if (!emailId) {
      return NextResponse.json({ error: 'Email ID required' }, { status: 400 });
    }

    if (
      !applicationStatus ||
      !VALID_APPLICATION_STATUSES.includes(applicationStatus)
    ) {
      return NextResponse.json(
        { error: 'A valid applicationStatus is required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('job_email_generator');
    const collection = db.collection('email_history');

    const historyEntry = {
      status: applicationStatus,
      changedAt: new Date().toISOString(),
      ...(note ? { note } : {}),
    };

    const result = await collection.updateOne(
      { _id: new ObjectId(emailId) },
      {
        $set: { applicationStatus },
        $push: { statusHistory: historyEntry } as any,
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Email not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, applicationStatus });
  } catch (error) {
    console.error('Error updating application status:', error);
    return NextResponse.json(
      { error: 'Failed to update application status' },
      { status: 500 }
    );
  }
}

// DELETE: Remove email from history
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const emailId = searchParams.get('emailId');

    if (!emailId) {
      return NextResponse.json({ error: 'Email ID required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('job_email_generator');
    const collection = db.collection('email_history');

    const result = await collection.deleteOne({ _id: new ObjectId(emailId) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Email not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Email deleted from history',
    });
  } catch (error) {
    console.error('Error deleting email from history:', error);
    return NextResponse.json(
      { error: 'Failed to delete email from history' },
      { status: 500 }
    );
  }
}
