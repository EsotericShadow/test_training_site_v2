import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { csrfUtils, honeypotUtils, rateLimiter, securityHeaders } from '../../../../../lib/security-utils';

export async function POST() {
  try {
    // Get client IP
    const headersList = await headers(); // Await headers() to fetch asynchronously
    const forwarded = headersList.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : headersList.get('x-real-ip') || 'unknown';

    // Check rate limiting
    if (rateLimiter.isRateLimited(ip, 10, 5 * 60 * 1000)) { // 10 requests per 5 minutes
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Generate security tokens
    const csrfToken = csrfUtils.generateToken();
    const honeypotField = honeypotUtils.generateFieldName();
    const sessionId = csrfUtils.generateToken(); // Use as session identifier

    // Store CSRF token in session/memory (in production, use Redis or database)
    // For now, we'll include it in the response and validate it on submission
    
    const securityData = {
      csrfToken,
      honeypotField,
      honeypotValue: '',
      sessionId,
      timestamp: Date.now()
    }; 

    // Create response with security headers
    const response = NextResponse.json(securityData);
    
    // Add security headers
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    // Set secure cookie with CSRF token
    response.cookies.set('csrf-token', csrfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    return response;

  } catch (error) {
    console.error('Security initialization error:', error);
    return NextResponse.json(
      { error: 'Security initialization failed' },
      { status: 500 }
    );
  }
}