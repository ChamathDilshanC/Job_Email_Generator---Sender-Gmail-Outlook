import { hasStoredRefreshToken } from '@/lib/googleAuth';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Lets the UI check whether background/scheduled sending is set up for a
 * user (i.e. we have a stored refresh token), so it can prompt a
 * "Reconnect Google Account" flow when it isn't rather than failing silently
 * at the scheduled send time.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 401 });
  }

  try {
    const hasRefreshToken = await hasStoredRefreshToken(userId);
    return NextResponse.json({ hasRefreshToken });
  } catch (error) {
    console.error('Error checking Google auth status:', error);
    return NextResponse.json(
      { error: 'Failed to check Google auth status' },
      { status: 500 }
    );
  }
}
