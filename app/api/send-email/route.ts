import { google } from 'googleapis';
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

    // Create OAuth2 client and set the user's Google access token
    // (obtained client-side via @react-oauth/google, scoped to gmail.send)
    const oauth2Client = new google.auth.OAuth2();

    oauth2Client.setCredentials({
      access_token: accessToken,
    });

    // Create Gmail API client
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Create MIME message
    const boundary = '----=_Part_' + Date.now();
    const altBoundary = '----=_Alt_' + Date.now();
    const nl = '\r\n';

    let message = [
      `To: ${to}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      `Content-Type: multipart/mixed; boundary="${boundary}"`,
      '',
      `--${boundary}`,
      `Content-Type: multipart/alternative; boundary="${altBoundary}"`,
      '',
      `--${altBoundary}`,
      'Content-Type: text/plain; charset=UTF-8',
      'Content-Transfer-Encoding: 7bit',
      '',
      bodyText.replace(/<[^>]*>/g, ''), // Strip HTML tags for plain text version
      '',
      `--${altBoundary}`,
      'Content-Type: text/html; charset=UTF-8',
      'Content-Transfer-Encoding: 7bit',
      '',
      bodyText,
      '',
      `--${altBoundary}--`,
      '',
    ].join(nl);

    // Add attachments
    if (attachments && attachments.length > 0) {
      for (const attachment of attachments) {
        message += [
          `--${boundary}`,
          `Content-Type: ${attachment.mimeType}; name="${attachment.filename}"`,
          'Content-Transfer-Encoding: base64',
          `Content-Disposition: attachment; filename="${attachment.filename}"`,
          '',
          attachment.data,
          '',
        ].join(nl);
      }
    }

    message += `--${boundary}--`;

    // Encode message in base64url
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // Send email
    const result = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    return NextResponse.json({
      success: true,
      messageId: result.data.id,
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
