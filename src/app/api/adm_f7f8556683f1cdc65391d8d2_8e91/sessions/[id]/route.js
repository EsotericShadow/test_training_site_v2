import { NextResponse } from 'next/server';
import { withSecureAuth } from '../../../../../../lib/secure-jwt';
import { logger, handleApiError } from '../../../../../../lib/logger';
import { terminateSession } from '../../../../../../lib/session-manager';

// DELETE handler to terminate a specific session
async function terminateSpecificSession(request, { params }) {
  try {
    // Get session ID from URL params
    const sessionId = params.id;
    
    // Get client IP address
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    
    // Log request
    logger.info('Terminate session request', { 
      ip, 
      route: request.nextUrl.pathname,
      method: request.method,
      sessionId
    });
    
    // Get user ID from auth (provided by withSecureAuth)
    const userId = request.auth.user.id;
    
    // Terminate the specified session
    const success = await terminateSession(sessionId, userId);
    
    if (!success) {
      logger.warn('Terminate session failed: Unauthorized or not found', { ip, userId, sessionId });
      
      return NextResponse.json(
        { error: 'Unauthorized or session not found' },
        { status: 403 }
      );
    }
    
    logger.info('Terminate session successful', { ip, userId, sessionId });
    
    return NextResponse.json({
      success: true
    });
    
  } catch (error) {
    // Use the handleApiError utility for consistent error handling
    const errorResponse = handleApiError(error, request, 'Failed to terminate session');
    
    return NextResponse.json(
      { error: errorResponse.error },
      { status: errorResponse.status }
    );
  }
}

// Export secured route
export const DELETE = withSecureAuth(terminateSpecificSession);

