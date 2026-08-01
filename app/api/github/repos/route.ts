import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username')?.trim();

    if (!username) {
      return NextResponse.json(
        { success: false, error: 'GitHub username or URL is required.' },
        { status: 400 }
      );
    }

    // Clean username (e.g. if a full URL was passed)
    const cleanUsername = username
      .replace(/(?:https?:\/\/)?(?:www\.)?github\.com\//i, '')
      .replace(/^@/, '')
      .replace(/\/+$/, '');

    const githubRes = await fetch(
      `https://api.github.com/users/${encodeURIComponent(cleanUsername)}/repos?sort=updated&per_page=100`,
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'JobMail-App',
        },
        next: { revalidate: 300 }, // Cache for 5 mins
      }
    );

    if (!githubRes.ok) {
      if (githubRes.status === 404) {
        return NextResponse.json(
          {
            success: false,
            error: `GitHub user "${cleanUsername}" was not found. Please check the profile URL/username.`,
          },
          { status: 404 }
        );
      }
      if (githubRes.status === 403) {
        return NextResponse.json(
          {
            success: false,
            error: 'GitHub API rate limit exceeded. Please try again in a few minutes.',
          },
          { status: 403 }
        );
      }
      return NextResponse.json(
        {
          success: false,
          error: `Failed to fetch GitHub repositories (${githubRes.statusText}).`,
        },
        { status: githubRes.status }
      );
    }

    const repos = await githubRes.json();
    return NextResponse.json({
      success: true,
      username: cleanUsername,
      count: repos.length,
      repos,
    });
  } catch (error) {
    console.error('Error fetching GitHub repos:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch GitHub repos.',
      },
      { status: 500 }
    );
  }
}
