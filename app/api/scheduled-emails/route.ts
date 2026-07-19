import clientPromise from '@/lib/mongodb';
import { randomUUID } from 'crypto';
import { Collection, ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';

let indexesEnsured = false;
async function ensureIndexes(collection: Collection) {
  if (indexesEnsured) return;
  indexesEnsured = true;
  try {
    await Promise.all([
      collection.createIndex({ status: 1, scheduledFor: 1 }),
      collection.createIndex({ userId: 1, status: 1 }),
    ]);
  } catch (error) {
    console.error('Error ensuring scheduled_emails indexes:', error);
  }
}

async function getCollection() {
  const client = await clientPromise;
  const db = client.db('job_email_generator');
  const collection = db.collection('scheduled_emails');
  await ensureIndexes(collection);
  return collection;
}

function toResponse(doc: any) {
  return { ...doc, id: doc._id.toString(), _id: undefined };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 401 });
    }

    const collection = await getCollection();
    const scheduled = await collection
      .find({ userId })
      .sort({ scheduledFor: 1 })
      .toArray();

    return NextResponse.json({ scheduled: scheduled.map(toResponse) });
  } catch (error) {
    console.error('Error loading scheduled emails:', error);
    return NextResponse.json(
      { error: 'Failed to load scheduled emails' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      to,
      subject,
      bodyHtml,
      attachments,
      attachmentNames,
      scheduledFor,
      companyName,
      position,
      templateId,
      templateName,
    } = body;

    if (!userId || !to || !subject || !bodyHtml || !scheduledFor) {
      return NextResponse.json(
        { error: 'userId, to, subject, bodyHtml, and scheduledFor are required' },
        { status: 400 }
      );
    }

    const scheduledDate = new Date(scheduledFor);
    if (Number.isNaN(scheduledDate.getTime()) || scheduledDate.getTime() <= Date.now()) {
      return NextResponse.json(
        { error: 'scheduledFor must be a valid future date/time' },
        { status: 400 }
      );
    }

    const collection = await getCollection();
    const trackingId = randomUUID();

    const result = await collection.insertOne({
      userId,
      to,
      subject,
      bodyHtml,
      attachments: attachments || [],
      attachmentNames: attachmentNames || {},
      scheduledFor: scheduledDate,
      status: 'pending',
      companyName,
      position,
      templateId,
      templateName,
      trackingId,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      id: result.insertedId.toString(),
      trackingId,
    });
  } catch (error) {
    console.error('Error creating scheduled email:', error);
    return NextResponse.json(
      { error: 'Failed to schedule email' },
      { status: 500 }
    );
  }
}

// PATCH: cancel a pending scheduled email, or move its send time
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const body = await request.json();
    const { status, scheduledFor } = body as {
      status?: 'cancelled';
      scheduledFor?: string;
    };

    const update: Record<string, unknown> = {};
    if (status === 'cancelled') update.status = 'cancelled';
    if (scheduledFor) {
      const date = new Date(scheduledFor);
      if (Number.isNaN(date.getTime()) || date.getTime() <= Date.now()) {
        return NextResponse.json(
          { error: 'scheduledFor must be a valid future date/time' },
          { status: 400 }
        );
      }
      update.scheduledFor = date;
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
    }

    const collection = await getCollection();
    // Only a still-pending send can be cancelled or rescheduled.
    const result = await collection.updateOne(
      { _id: new ObjectId(id), status: 'pending' },
      { $set: update }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Scheduled email not found or no longer pending' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating scheduled email:', error);
    return NextResponse.json(
      { error: 'Failed to update scheduled email' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const collection = await getCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Scheduled email not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting scheduled email:', error);
    return NextResponse.json(
      { error: 'Failed to delete scheduled email' },
      { status: 500 }
    );
  }
}
