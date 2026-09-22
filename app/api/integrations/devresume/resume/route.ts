import { NextRequest, NextResponse } from 'next/server';

const MAX_RESUME_BYTES = 5 * 1024 * 1024;

export async function GET(request: NextRequest) {
  const userId = new URL(request.url).searchParams.get('userId');
  const endpoint = process.env.DEVRESUME_RESUME_ENDPOINT;
  const secret = process.env.JOBMAIL_INTEGRATION_SECRET;

  if (!userId) return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
  if (!endpoint || !secret) {
    return NextResponse.json({ error: 'DevResume integration is not configured.' }, { status: 503 });
  }

  try {
    const response = await fetch(endpoint, {
      headers: { 'x-jobmail-integration-secret': secret },
      cache: 'no-store',
    });
    if (!response.ok) {
      return NextResponse.json(
        { error: response.status === 404 ? 'No DevResume PDF is available.' : 'Could not retrieve the DevResume resume.' },
        { status: response.status === 404 ? 404 : 502 }
      );
    }

    const contentType = response.headers.get('content-type') || 'application/pdf';
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length === 0 || bytes.length > MAX_RESUME_BYTES) {
      return NextResponse.json({ error: 'The DevResume file is invalid or too large.' }, { status: 502 });
    }

    return NextResponse.json({
      resume: {
        fileName: response.headers.get('content-disposition')?.match(/filename="?([^"]+)"?/)?.[1] || 'DevResume.pdf',
        mimeType: contentType,
        size: bytes.length,
        lastModified: response.headers.get('last-modified'),
        data: bytes.toString('base64'),
      },
    });
  } catch (error) {
    console.error('Error retrieving DevResume resume:', error);
    return NextResponse.json({ error: 'DevResume resume retrieval failed.' }, { status: 502 });
  }
}
