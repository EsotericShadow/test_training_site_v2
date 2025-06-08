import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from './lib/session-manager';

// Ensure JWT_SECRET is set - this is critical for security
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET environment variable is not set!');
  console.error('Application cannot start securely without a JWT_SECRET.');
  console.error('Please set this environment variable before starting the application.');
  throw new Error('JWT_SECRET environment variable is not set');
}

// Type definition for session validation result
interface SessionValidationResult {
  valid: boolean;
  reason?: string;
  session?: any;
  needsRenewal?: boolean;
  timeLeft?: number;
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
    // Look for 'admin_token' cookie
    const token = request.cookies.get('admin_token')?.value;
    
    // If no token, redirect to login
    if (!token) {
      return NextResponse.redirect(new URL('/adm_f7f8556683f1cdc65391d8d2_8e91', request.url));
    }

    // Validate session using the same logic as the auth route
    try {
      const sessionResult = await validateSession(token, request) as SessionValidationResult;
      
      if (!sessionResult.valid) {
        console.error('Session validation failed:', sessionResult.reason);
        return NextResponse.redirect(new URL('/adm_f7f8556683f1cdc65391d8d2_8e91', request.url));
      }
      
      // Session is valid, allow the request
      return NextResponse.next();
    } catch (error) {
      console.error('Session validation error in middleware:', error);
      return NextResponse.redirect(new URL('/adm_f7f8556683f1cdc65391d8d2_8e91', request.url));
    }
  }

  // Allow all other routes, including root (/)
  return NextResponse.next();
}

// Update matcher to include all routes for HTTPS enforcement
export const config = {
  matcher: [
    // Match all paths for HTTPS enforcement
    '/(.*)',
    // Exclude static files and API routes that need different headers
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

