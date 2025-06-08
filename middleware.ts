import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from './lib/session-manager';

// Type definition for enhanced session validation result
interface SessionValidationResult {
  valid: boolean;
  reason?: string;
  session?: any;
  needsRenewal?: boolean;
  timeLeft?: number;
  securityLevel?: string;
}

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const isAdminPath = url.pathname.startsWith('/adm_f7f8556683f1cdc65391d8d2_8e91');
  
  // HTTPS Enforcement - Redirect HTTP to HTTPS in production
  if (process.env.NODE_ENV === 'production' && 
      url.protocol === 'http:' && 
      !url.hostname.includes('localhost')) {
    url.protocol = 'https:';
    return NextResponse.redirect(url);
  }
  
  // Only check admin paths for authentication
  if (isAdminPath) {
    // Get client IP for logging
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    // Look for 'admin_token' cookie
    const token = request.cookies.get('admin_token')?.value;
    
    // If no token, redirect to login
    if (!token) {
      console.warn(`Middleware: No admin token found for ${url.pathname} from IP ${ip}`);
      return NextResponse.redirect(new URL('/adm_f7f8556683f1cdc65391d8d2_8e91', request.url));
    }

    // Validate session using enhanced session manager
    try {
      const sessionResult = await validateSession(token, request) as SessionValidationResult;
      
      if (!sessionResult.valid) {
        console.warn(`Middleware: Session validation failed for ${url.pathname} from IP ${ip}: ${sessionResult.reason}`);
        
        // Clear invalid token cookie
        const response = NextResponse.redirect(new URL('/adm_f7f8556683f1cdc65391d8d2_8e91', request.url));
        response.cookies.delete('admin_token');
        return response;
      }
      
      // Log successful validation with security level
      console.log(`Middleware: Session valid for ${url.pathname} from IP ${ip} (${sessionResult.securityLevel || 'unknown'} security)`);
      
      // Create response to continue
      const response = NextResponse.next();
      
      // Add security headers for admin paths
      response.headers.set('X-Frame-Options', 'DENY');
      response.headers.set('X-Content-Type-Options', 'nosniff');
      response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
      response.headers.set('X-XSS-Protection', '1; mode=block');
      
      // Add CSP header for admin paths
      response.headers.set(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self';"
      );
      
      // If session needs renewal, add a header to indicate this to the frontend
      if (sessionResult.needsRenewal) {
        response.headers.set('X-Session-Renewal-Needed', 'true');
        response.headers.set('X-Session-Time-Left', sessionResult.timeLeft?.toString() || '0');
      }
      
      return response;
    } catch (error) {
      console.error(`Middleware: Session validation error for ${url.pathname} from IP ${ip}:`, error);
      
      // Clear potentially corrupted token cookie
      const response = NextResponse.redirect(new URL('/adm_f7f8556683f1cdc65391d8d2_8e91', request.url));
      response.cookies.delete('admin_token');
      return response;
    }
  }

  // For non-admin paths, add basic security headers
  const response = NextResponse.next();
  
  // Add security headers for all paths
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  return response;
}

// Update matcher to include all routes for HTTPS enforcement and security headers
export const config = {
  matcher: [
    // Match all paths for HTTPS enforcement and security headers
    '/(.*)',
    // Exclude static files and API routes that need different headers
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
};

