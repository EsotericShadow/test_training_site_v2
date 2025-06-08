// src/app/api/adm_f7f8556683f1cdc65391d8d2_8e91/sessions/route.js
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { logger, handleApiError } from '../../../../../lib/logger';
import { validateSession, getUserSessions, terminateOtherSessions } from '../../../../../lib/session-manager';

// Ensure JWT_SECRET is set - this is critical for security
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

// GET handler to list all active sessions for the current user
export async function GET(request) {
  try {
    // Get client IP address
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    
    // Log request
    logger.info('Session list request', { 
      ip, 
      route: request.nextUrl.pathname,
      method: request.method
    });
    
    // Get token from cookies
    const token = request.cookies.get('admin_token')?.value;
    
    if (!token) {
      logger.warn('Session list failed: No token', { ip });
      
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Validate the session
    const sessionResult = await validateSession(token, request);
    
    if (!sessionResult.valid) {
      logger.warn(`Session list failed: ${sessionResult.reason}`, { ip });
      
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }
    
    // Get user ID from token
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;
    
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
      current: session.token === token
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
export async function DELETE(request) {
  try {
    // Get client IP address
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    
    // Log request
    logger.info('Terminate other sessions request', { 
      ip, 
      route: request.nextUrl.pathname,
      method: request.method
    });
    
    // Get token from cookies
    const token = request.cookies.get('admin_token')?.value;
    
    if (!token) {
      logger.warn('Terminate other sessions failed: No token', { ip });
      
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Validate the session
    const sessionResult = await validateSession(token, request);
    
    if (!sessionResult.valid) {
      logger.warn(`Terminate other sessions failed: ${sessionResult.reason}`, { ip });
      
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }
    
    // Get user ID from token
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;
    
    // Terminate all other sessions
    const count = await terminateOtherSessions(userId, token);
    
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
