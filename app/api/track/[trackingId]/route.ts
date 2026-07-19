import clientPromise from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// A well-known 1x1 transparent GIF, served regardless of whether the
// tracking ID matches anything — the response must never reveal whether an
// ID exists (unguessable crypto.randomUUID() IDs are the actual defense).
const TRANSPARENT_GIF = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==',
  'base64'
);

const PIXEL_HEADERS = {
  'Content-Type': 'image/gif',
  'Content-Length': TRANSPARENT_GIF.length.toString(),
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};

export async function GET(
  request: NextRequest,
  { params }: { params: { trackingId: string } }
) {
  const trackingId = params.trackingId;

  if (trackingId) {
    try {
      const client = await clientPromise;
      const db = client.db('job_email_generator');
      const collection = db.collection('email_history');
      const nowIso = new Date().toISOString();

      await collection.updateOne({ trackingId }, [
        {
          $set: {
            openCount: { $add: [{ $ifNull: ['$openCount', 0] }, 1] },
            firstOpenedAt: { $ifNull: ['$firstOpenedAt', nowIso] },
            lastOpenedAt: nowIso,
          },
        },
      ]);
    } catch (error) {
      console.error('Error recording email open:', error);
    }
  }

  return new NextResponse(TRANSPARENT_GIF, {
    status: 200,
    headers: PIXEL_HEADERS,
  });
}
