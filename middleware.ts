import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Look for 'admin_token' instead of 'token' to match the login API
  const token = request.cookies.get('admin_token')?.value;
  const isAdminPath = request.nextUrl.pathname.startsWith('/admin');

  // Only redirect unauthenticated admin paths to /admin login
  if (isAdminPath && !token) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  // Allow all other routes, including root (/)
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*']
};

