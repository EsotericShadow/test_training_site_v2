import { NextResponse } from 'next/server';
import { withSecureAuth } from '../../../../../lib/secure-jwt';
import { logger, handleApiError } from '../../../../../lib/logger';
import { getUserSessions, terminateOtherSessions } from '../../../../../lib/session-manager';

// GET handler to list all active sessions for the current user
async function getSessionsList(request) {
  try {
    // Get client IP address
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    
    // Log request
    logger.info('Session list request', { 
      ip, 
      route: request.nextUrl.pathname,
      method: request.method
    });
    
    // Get user ID from auth (provided by withSecureAuth)
    const userId = request.auth.user.id;
    const currentToken = request.auth.token;
    
    // Get all sessions for the user
    const sessions = await getUserSessions(userId);
    
    // Format sessions for client
    const formattedSessions = sessions.map(session => ({
      id: session.id,
      createdAt: session.created_at,
      expiresAt: session.expires_at,
      lastActivity: session.last_activity,
      ipAddress: session.ip_address,
      userAgent: session.user_agent,
      current: session.token === currentToken
    }));
    
    logger.info('Session list successful', { ip, userId, sessionCount: sessions.length });
    
    return NextResponse.json({
      sessions: formattedSessions
    });
    
  } catch (error) {
    // Use the handleApiError utility for consistent error handling
    const errorResponse = handleApiError(error, request, 'Failed to list sessions');
    
    return NextResponse.json(
      { error: errorResponse.error },
      { status: errorResponse.status }
    );
  }
}

// DELETE handler to terminate all other sessions
async function terminateOtherUserSessions(request) {
  try {
    // Get client IP address
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    
    // Log request
    logger.info('Terminate other sessions request', { 
      ip, 
      route: request.nextUrl.pathname,
      method: request.method
    });
    
    // Get user ID and token from auth (provided by withSecureAuth)
    const userId = request.auth.user.id;
    const currentToken = request.auth.token;
    
    // Terminate all other sessions
    const count = await terminateOtherSessions(userId, currentToken);
    
    logger.info('Terminate other sessions successful', { ip, userId, terminatedCount: count });
    
    return NextResponse.json({
      success: true,
      terminatedCount: count
    });
    
  } catch (error) {
    // Use the handleApiError utility for consistent error handling
    const errorResponse = handleApiError(error, request, 'Failed to terminate other sessions');
    
    return NextResponse.json(
      { error: errorResponse.error },
      { status: errorResponse.status }
    );
  }
}

// Export secured routes
export const GET = withSecureAuth(getSessionsList);
export const DELETE = withSecureAuth(terminateOtherUserSessions);

