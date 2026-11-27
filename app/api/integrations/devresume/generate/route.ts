import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getGoogleUser } from '@/lib/jobmailAuth';

const MAX_ROLE_LENGTH = 120;
const MAX_COMPANY_LENGTH = 160;
const MAX_JOB_DESCRIPTION_LENGTH = 12_000;
const REQUEST_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function cleanText(value: unknown, maxLength: number): string {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ').slice(0, maxLength) : '';
}

async function getConnection(userId: string) {
  const client = await clientPromise;
  return client.db('job_email_generator').collection('devresume_connections').findOne(
    { jobmailUserId: userId },
    { projection: { _id: 0, devresumeAccountId: 1 } }
  );
}

async function callDevResume(path: string, options: RequestInit = {}) {
  const baseUrl = process.env.DEVRESUME_APP_URL;
  const secret = process.env.JOBMAIL_INTEGRATION_SECRET;
  if (!baseUrl || !secret) {
    return NextResponse.json({ error: 'DevResume integration is not configured.' }, { status: 503 });
  }

  const response = await fetch(`${baseUrl.replace(/\/$/, '')}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${secret}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    cache: 'no-store',
  });
  const payload = await response.json().catch(() => ({ error: 'Invalid DevResume response.' }));
  return NextResponse.json(payload, { status: response.status });
}

export async function POST(request: NextRequest) {
  const user = await getGoogleUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const targetRole = cleanText(body.targetRole, MAX_ROLE_LENGTH);
  const targetCompany = cleanText(body.targetCompany, MAX_COMPANY_LENGTH);
  const jobDescription = cleanText(body.jobDescription, MAX_JOB_DESCRIPTION_LENGTH);
  if (!targetRole) return NextResponse.json({ error: 'Target role is required.' }, { status: 400 });

  const connection = await getConnection(user.id);
  if (!connection?.devresumeAccountId) {
    return NextResponse.json({ error: 'Connect DevResume before generating a tailored CV.' }, { status: 409 });
  }

  return callDevResume('/api/integrations/jobmail/resume/generate', {
    method: 'POST',
    body: JSON.stringify({
      accountId: connection.devresumeAccountId,
      targetRole,
      targetCompany,
      jobDescription,
    }),
  });
}

export async function GET(request: NextRequest) {
  const user = await getGoogleUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const requestId = new URL(request.url).searchParams.get('requestId') || '';
  if (!REQUEST_ID_PATTERN.test(requestId)) {
    return NextResponse.json({ error: 'A valid generation request is required.' }, { status: 400 });
  }

  const connection = await getConnection(user.id);
  if (!connection?.devresumeAccountId) {
    return NextResponse.json({ error: 'DevResume is not connected.' }, { status: 409 });
  }

  const query = new URLSearchParams({
    requestId,
    accountId: connection.devresumeAccountId,
  });
  return callDevResume(`/api/integrations/jobmail/resume/generate?${query.toString()}`);
}
