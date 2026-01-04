import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

const API_BASE_URL = 'http://universities.hipolabs.com';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const name = searchParams.get('name');
    const country = searchParams.get('country');

    if (!name) {
      return NextResponse.json(
        { error: 'Name parameter is required' },
        { status: 400 }
      );
    }

    // Build the API URL
    let apiUrl = `${API_BASE_URL}/search?name=${encodeURIComponent(name)}`;
    if (country) {
      apiUrl += `&country=${encodeURIComponent(country)}`;
    }

    // Fetch from the external API (server-side, no mixed content issues)
    const response = await fetch(apiUrl);

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch universities' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in universities API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
