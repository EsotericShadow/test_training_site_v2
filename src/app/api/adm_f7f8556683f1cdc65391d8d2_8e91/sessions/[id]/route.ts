import { NextResponse, NextRequest } from 'next/server';

export const runtime = 'nodejs';
import { withSecureAuth, AuthResult } from '../../../../../../lib/secure-jwt';
import { logger, handleApiError } from '../../../../../../lib/logger';
import { terminateSession } from '../../../../../../lib/session-manager';

// DELETE handler to terminate a specific session
async function terminateSpecificSession(
  request: NextRequest, 
  { params, auth }: { params: Promise<{ id: string }>; auth: AuthResult }
) {
  try {
    // Get session ID from URL params
    const resolvedParams = await params;
    const sessionId = parseInt(resolvedParams.id, 10);
    
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
    const userId = auth.user?.id;

    if (typeof userId !== 'number') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Terminate the specified session
    const success = await terminateSession(String(sessionId), userId);
    
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
    const errorResponse = await handleApiError(error, request, 'Failed to terminate session');
    
    return NextResponse.json(
      { error: errorResponse.error },
      { status: errorResponse.status }
    );
  }
}

// Export secured route
export const DELETE = withSecureAuth(terminateSpecificSession);
