import { NextResponse } from 'next/server';
import { validateToken } from '../../../../../lib/csrf';
import { logger, handleApiError } from '../../../../../lib/logger';
import { validateSession, terminateSession } from '../../../../../lib/session-manager';
import { verifySecureToken } from '../../../../../lib/secure-jwt';

export async function POST(request) {
  try {
    // Get client IP address (original approach)
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    
    // Log logout attempt
    logger.info('Logout attempt', { 
      ip, 
      route: request.nextUrl.pathname,
      method: request.method
    });
    
    // Get the admin token from cookies
    const token = request.cookies.get('admin_token')?.value;

    if (!token) {
      logger.warn('Logout failed: No token', { ip });
      
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Validate the session using session manager
    const sessionResult = await validateSession(token, request);
    
    if (!sessionResult.valid) {
      logger.warn(`Logout failed: ${sessionResult.reason}`, { ip });
      
      // Even if the session is invalid, we'll still clear the cookie
      const response = NextResponse.json({ success: true });
      response.cookies.delete('admin_token');
      return response;
    }

    // Get the CSRF token from the request body
    const body = await request.json();
    const csrfToken = body.csrfToken;

    // Validate CSRF token
    if (!csrfToken || !validateToken(token, csrfToken)) {
      logger.warn('Logout failed: Invalid CSRF token', { 
        ip,
        hasToken: !!csrfToken
      });
      
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }

    // Verify token using our secure module to get user ID
    const tokenResult = verifySecureToken(token, request);
    if (!tokenResult.valid) {
      logger.warn('Logout failed: Invalid token structure', { ip });
      
      // Still clear the cookie even if token is malformed
      const response = NextResponse.json({ success: true });
      response.cookies.delete('admin_token');
      return response;
    }

    const userId = tokenResult.decoded.id;

    // Terminate the session using the session manager
    await terminateSession(token, userId);
    
    // Log successful logout
    logger.info('Logout successful', { ip, userId });

    // Clear cookie
    const response = NextResponse.json({ success: true });
    response.cookies.delete('admin_token');

    return response;

  } catch (error) {
    // Use the handleApiError utility for consistent error handling
    const errorResponse = handleApiError(error, request, 'Logout failed');
    
    return NextResponse.json(
      { error: errorResponse.error },
      { status: errorResponse.status }
    );
  }
}

