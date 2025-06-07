// src/app/api/admin/auth/route.js
import { NextResponse } from 'next/server';
import { logger, handleApiError } from '../../../../../lib/logger';
import { validateSession, renewSession } from '../../../../../lib/session-manager'; // Import the session manager functions

export async function GET(request) {
  try {
    // Get client IP address
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    
    // Log auth check attempt
    logger.info('Auth check attempt', { 
      ip, 
      route: request.nextUrl.pathname,
      method: request.method
    });
    
    const token = request.cookies.get('admin_token')?.value;

    if (!token) {
      logger.warn('Auth check failed: No token', { ip });
      
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Validate the session using the session manager
    const sessionResult = await validateSession(token, request);
    
    if (!sessionResult.valid) {
      logger.warn(`Auth check failed: ${sessionResult.reason}`, { ip });
      
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    // Get the session data
    const session = sessionResult.session;
    
    // Check if session needs renewal
    let response = NextResponse.json({
      authenticated: true,
      user: {
        id: session.user_id,
        username: session.username,
        email: session.email
      }
    });
    
    // If session needs renewal, renew it and update the cookie
    if (sessionResult.needsRenewal) {
      logger.info('Renewing session', { ip, userId: session.user_id });
      
      const renewalData = await renewSession(session, request);
      
      response.cookies.set('admin_token', renewalData.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: renewalData.maxAge
      } );
    }

    // Log successful auth check
    logger.info('Auth check successful', { 
      ip, 
      userId: session.user_id,
      username: session.username
    });

    return response;
  } catch (error) {
    // Use the handleApiError utility for consistent error handling
    const errorResponse = handleApiError(error, request, 'Authentication check failed');
    
    return NextResponse.json(
      { error: errorResponse.error },
      { status: errorResponse.status }
    );
  }
}

