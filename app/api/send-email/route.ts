import { sendGmailMessage } from '@/lib/sendGmail';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, subject, body: bodyText, attachments, accessToken } = body;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 401 }
      );
    }

    if (!to || !subject || !bodyText) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, or body' },
        { status: 400 }
      );
    }

    const result = await sendGmailMessage(
      { to, subject, bodyHtml: bodyText, attachments },
      accessToken
    );

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
    });
  } catch (error: any) {
    console.error('Error sending email:', error);

    // Check if it's an authentication error
    const isAuthError =
      error.code === 401 ||
      error.message?.includes('invalid authentication') ||
      error.message?.includes('Invalid Credentials') ||
      error.response?.status === 401;

    if (isAuthError) {
      return NextResponse.json(
        {
          error: 'Authentication expired. Please sign out and sign in again.',
          authError: true,
          details: error.response?.data || error.toString(),
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        error: error.message || 'Failed to send email',
        details: error.response?.data || error.toString(),
      },
      { status: 500 }
    );
  }
}
