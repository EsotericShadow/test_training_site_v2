import { NextRequest, NextResponse } from 'next/server';
import { validateSession, SessionValidationResult } from '../lib/session-manager';
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

    try {
      // Use the existing session manager with proper typing
      const sessionResult = await validateSession(token, request) as SessionValidationResult;

      if (!sessionResult.valid) {
        logger.warn('Middleware: Session validation failed', { 
          path: url.pathname, 
          ip, 
          reason: sessionResult.reason 
        });
        
        const response = NextResponse.redirect(new URL('/adm_f7f8556683f1cdc65391d8d2_8e91', request.url));
        response.cookies.delete('admin_token');
        return response;
      }

      logger.info('Middleware: Session valid', { 
        path: url.pathname, 
        ip, 
        userId: sessionResult.session?.user_id || 'anonymous',
        securityLevel: sessionResult.securityLevel 
      });

      const response = NextResponse.next();

      // Add security headers for admin paths
      response.headers.set('X-Frame-Options', 'DENY');
      response.headers.set('X-Content-Type-Options', 'nosniff');
      response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
      response.headers.set('X-XSS-Protection', '1; mode=block');
      // Define Content Security Policy based on environment
      let csp = "default-src 'self'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://www.google-analytics.com;";
      if (process.env.NODE_ENV === 'production') {
        csp += " script-src 'self' https://www.googletagmanager.com https://va.vercel-scripts.com; style-src 'self' 'sha256-zlqnbDt84zf1iSefLU/ImC54isoprH/MRiVZGskwexk=';";
      } else {
        csp += " script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline';";
      }

      response.headers.set('Content-Security-Policy', csp);

      // Add session renewal headers if needed
      if (sessionResult.needsRenewal) {
        response.headers.set('X-Session-Renewal-Needed', 'true');
        response.headers.set('X-Session-Time-Left', sessionResult.timeLeft?.toString() || '0');
      }

      return response;
    } catch (error) {
      logger.error('Middleware: Session validation error', { 
        path: url.pathname, 
        ip, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      
      const response = NextResponse.redirect(new URL('/adm_f7f8556683f1cdc65391d8d2_8e91', request.url));
      response.cookies.delete('admin_token');
      return response;
    }
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

