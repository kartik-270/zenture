import { NextRequest, NextResponse } from 'next/server';

// Middleware is minimal since auth is handled client-side with localStorage
// Server-side middleware cannot access localStorage
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Allow all routes - client-side will handle auth protection
  // This prevents the redirect loop since token is stored in localStorage
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
