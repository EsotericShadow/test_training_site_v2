import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Ensure JWT_SECRET is set - this is critical for security
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET environment variable is not set!');
  console.error('Application cannot start securely without a JWT_SECRET.');
  console.error('Please set this environment variable before starting the application.');
  // Cannot use process.exit(1) in Edge Runtime
  // Instead, we'll throw an error that will be caught by Next.js
  throw new Error('JWT_SECRET environment variable is not set');
}

// Store JWT_SECRET in a variable that TypeScript knows is not undefined
const SECRET_KEY = JWT_SECRET as string;

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const isAdminPath = url.pathname.startsWith('/admin');
  
  // HTTPS Enforcement - Redirect HTTP to HTTPS in production
  if (process.env.NODE_ENV === 'production' && 
      url.protocol === 'http:' && 
      !url.hostname.includes('localhost')) {
    url.protocol = 'https:';
    return NextResponse.redirect(url);
  }
  
  // Only check admin paths for authentication
  if (isAdminPath) {
    // Look for 'admin_token' instead of 'token' to match the login API
    const token = request.cookies.get('admin_token')?.value;
    
    // If no token, redirect to login
    if (!token) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    // Verify token if present
    try {
      // Use SECRET_KEY instead of JWT_SECRET
      jwt.verify(token, SECRET_KEY);
      // Token is valid, allow the request
      return NextResponse.next();
    } catch (error) {
      // Token is invalid, redirect to login
      console.error('Invalid token:', error);
      return NextResponse.redirect(new URL('/admin', request.url));
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

