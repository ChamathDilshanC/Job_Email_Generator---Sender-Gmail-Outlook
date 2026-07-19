import {
  getOAuth2Client,
  hasStoredRefreshToken,
  storeRefreshTokenIfPresent,
} from '@/lib/googleAuth';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Exchanges the authorization `code` returned by @react-oauth/google's
 * auth-code flow for tokens. The refresh token (if Google issued one — only
 * guaranteed on a user's first-ever consent for this client+scope) is
 * encrypted and stored server-side for background/scheduled sending. Only
 * the access token is returned to the client, matching how the previous
 * implicit-flow session worked for immediate sends.
 */
export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();
    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code is required' },
        { status: 400 }
      );
    }

    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.access_token) {
      return NextResponse.json(
        { error: 'Google did not return an access token' },
        { status: 502 }
      );
    }

    const userInfoResponse = await fetch(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      { headers: { Authorization: `Bearer ${tokens.access_token}` } }
    );
    if (!userInfoResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch Google account info' },
        { status: 502 }
      );
    }
    const userInfo = await userInfoResponse.json();

    const user = {
      uid: userInfo.sub,
      email: userInfo.email,
      displayName: userInfo.name || userInfo.email,
      photoURL: userInfo.picture || '',
    };

    await storeRefreshTokenIfPresent(user.uid, tokens.refresh_token, tokens.scope);
    const hasRefreshToken = await hasStoredRefreshToken(user.uid);

    return NextResponse.json({
      accessToken: tokens.access_token,
      expiresIn: tokens.expiry_date
        ? Math.max(0, Math.floor((tokens.expiry_date - Date.now()) / 1000))
        : 3600,
      user,
      hasRefreshToken,
    });
  } catch (error) {
    console.error('Error exchanging Google authorization code:', error);
    return NextResponse.json(
      { error: 'Failed to complete Google sign-in' },
      { status: 500 }
    );
  }
}
