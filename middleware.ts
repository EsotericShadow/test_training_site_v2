import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
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