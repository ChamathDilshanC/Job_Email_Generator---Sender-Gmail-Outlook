import { getValidAccessTokenForUser } from '@/lib/googleAuth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();
    if (!userId || typeof userId !== 'string') {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const accessToken = await getValidAccessTokenForUser(userId);
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Google session could not be refreshed. Please sign in again.' },
        { status: 401 }
      );
    }

    return NextResponse.json({ accessToken, expiresIn: 3600 });
  } catch (error) {
    console.error('Error refreshing Google access token:', error);
    return NextResponse.json(
      { error: 'Failed to refresh Google session' },
      { status: 500 }
    );
  }
}
