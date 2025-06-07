import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { logger, handleApiError } from '../../../../../../lib/logger';
import { validateSession, terminateSession } from '../../../../../../lib/session-manager';

// Ensure JWT_SECRET is set - this is critical for security
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

// DELETE handler to terminate a specific session
export async function DELETE(request, { params }) {
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
    
    // Get token from cookies
    const token = request.cookies.get('admin_token')?.value;
    
    if (!token) {
      logger.warn('Terminate session failed: No token', { ip, sessionId });
      
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Validate the session
    const sessionResult = await validateSession(token, request);
    
    if (!sessionResult.valid) {
      logger.warn(`Terminate session failed: ${sessionResult.reason}`, { ip, sessionId });
      
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }
    
    // Get user ID from token
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;
    
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
