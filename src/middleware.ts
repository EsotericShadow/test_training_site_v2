import { NextRequest, NextResponse } from 'next/server';

import { logger } from '../lib/logger';


export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  
  // HTTPS Enforcement - Redirect HTTP to HTTPS in production
  if (process.env.NODE_ENV === 'production' &&
      url.protocol === 'http:' &&
      !url.hostname.includes('localhost')) {
    url.protocol = 'https:';
    return NextResponse.redirect(url);
  }

  // Check if this is an admin path
  const isAdminPath = url.pathname.startsWith('/adm_f7f8556683f1cdc65391d8d2_8e91');
  const isLoginPage = url.pathname === '/adm_f7f8556683f1cdc65391d8d2_8e91';

  // Only authenticate admin paths (except login page)
  if (isAdminPath && !isLoginPage) {
    const token = request.cookies.get('admin_token')?.value;
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';

    if (!token) {
      logger.warn('Middleware: No admin token found', { 
        path: url.pathname, 
        ip 
      });
      return NextResponse.redirect(new URL('/adm_f7f8556683f1cdc65391d8d2_8e91', request.url));
    }

    // If token is present, allow the request to proceed. Full session validation
    // will happen in the server component or API route.
    const response = NextResponse.next();

    // Add security headers for admin paths
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    // Define Content Security Policy based on environment
    let csp = "default-src 'self'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://www.google-analytics.com;";
    if (process.env.NODE_ENV === 'production') {
      csp += " script-src 'self' https://www.googletagmanager.com; style-src 'self' 'sha256-zlqnbDt84zf1iSefLU/ImC54isoprH/MRiVZGskwexk=';";
    } else {
      csp += " script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline';";
    }

    response.headers.set('Content-Security-Policy', csp);

    return response;
  }

  // For non-admin paths, add basic security headers
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

