import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Lightweight middleware — NO heavy imports (Prisma, bcrypt, etc.)
// Only checks for the session cookie existence to protect routes.
// Actual session validation happens server-side in API routes/pages.

const PUBLIC_PATHS = ['/', '/login', '/signup', '/api/auth'];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes, static assets, and API auth routes
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Check for NextAuth session cookie (works with both JWT and database sessions)
  const sessionToken =
    request.cookies.get('authjs.session-token')?.value ||
    request.cookies.get('__Secure-authjs.session-token')?.value ||
    request.cookies.get('next-auth.session-token')?.value ||
    request.cookies.get('__Secure-next-auth.session-token')?.value;

  if (!sessionToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.*|public).*)'],
};
