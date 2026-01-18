import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';

// GET: Fetch email history for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('job_email_generator');
    const collection = db.collection('email_history');

    const history = await collection
      .find({ userId })
      .sort({ sentDate: -1 }) // Newest first
      .skip(offset)
      .limit(limit)
      .toArray();

    // Transform _id to id for frontend compatibility
    const transformedHistory = history.map(doc => ({
      ...doc,
      id: doc._id.toString(),
      _id: undefined, // Remove _id from the response
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
