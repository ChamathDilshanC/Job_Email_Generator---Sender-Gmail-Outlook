import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const APP_ROUTES = [
  '/send-email',
  '/your-information',
  '/email-templates',
  '/cover-letter',
  '/history',
  '/scheduled',
  '/profile',
  '/settings',
  '/guide',
  '/documentation',
];

export function middleware(request: NextRequest) {
  if (APP_ROUTES.includes(request.nextUrl.pathname)) {
    return NextResponse.rewrite(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/send-email',
    '/your-information',
    '/email-templates',
    '/cover-letter',
    '/history',
    '/scheduled',
    '/profile',
    '/settings',
    '/guide',
    '/documentation',
  ],
};
