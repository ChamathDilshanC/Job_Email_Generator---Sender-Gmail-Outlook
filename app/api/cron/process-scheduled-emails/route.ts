import { getValidAccessTokenForUser } from '@/lib/googleAuth';
import clientPromise from '@/lib/mongodb';
import { sendGmailMessage, withTrackingPixel } from '@/lib/sendGmail';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Cap per invocation so a single serverless run can't run past its own
// timeout — any remainder is picked up on the next scheduled tick.
const BATCH_LIMIT = 20;

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error('CRON_SECRET is not configured — refusing all cron requests');
    return false;
  }
  return request.headers.get('authorization') === `Bearer ${secret}`;
}

async function processDueEmails() {
  const client = await clientPromise;
  const db = client.db('job_email_generator');
  const scheduled = db.collection('scheduled_emails');
  const history = db.collection('email_history');

  const due = await scheduled
    .find({ status: 'pending', scheduledFor: { $lte: new Date() } })
    .limit(BATCH_LIMIT)
    .toArray();

  const baseUrl = process.env.APP_BASE_URL?.replace(/\/$/, '') || '';
  let sent = 0;
  let failed = 0;

  for (const email of due) {
    try {
      const accessToken = await getValidAccessTokenForUser(email.userId);
      if (!accessToken) {
        await scheduled.updateOne(
          { _id: email._id },
          {
            $set: {
              status: 'failed',
              error: 'auth_expired',
              sentAt: new Date(),
            },
          }
        );
        failed++;
        continue;
      }

      const bodyHtml =
        email.trackingId && baseUrl
          ? withTrackingPixel(email.bodyHtml, email.trackingId, baseUrl)
          : email.bodyHtml;

      await sendGmailMessage(
        {
          to: email.to,
          subject: email.subject,
          bodyHtml,
          attachments: email.attachments,
        },
        accessToken
      );

      await history.insertOne({
        userId: email.userId,
        companyName: email.companyName || '',
        position: email.position || '',
        recipientEmail: email.to,
        templateId: email.templateId,
        templateName: email.templateName || 'Scheduled Email',
        sentDate: new Date().toISOString(),
        status: 'sent',
        attachments: {
          cv: email.attachmentNames?.cv || '',
          coverLetter: email.attachmentNames?.coverLetter,
        },
        emailSubject: email.subject,
        emailPreview:
          String(email.bodyHtml).replace(/<[^>]*>/g, ' ').slice(0, 200) + '...',
        trackingId: email.trackingId,
        createdAt: new Date(),
      });

      await scheduled.updateOne(
        { _id: email._id },
        { $set: { status: 'sent', sentAt: new Date() } }
      );
      sent++;
    } catch (error) {
      console.error(`Error sending scheduled email ${email._id}:`, error);
      await scheduled.updateOne(
        { _id: email._id },
        {
          $set: {
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error',
            sentAt: new Date(),
          },
        }
      );
      failed++;
    }
  }

  return { checked: due.length, sent, failed };
}

async function handleCronRequest(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const results = await processDueEmails();
    return NextResponse.json({ success: true, ...results });
  } catch (error) {
    console.error('Error processing scheduled emails:', error);
    return NextResponse.json(
      { error: 'Failed to process scheduled emails' },
      { status: 500 }
    );
  }
}

// Vercel Cron (and most external cron services) call via GET; support POST
// too so services that prefer it (e.g. some webhook-style cron triggers)
// also work.
export const GET = handleCronRequest;
export const POST = handleCronRequest;
