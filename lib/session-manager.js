// lib/session-manager.js
import jwt from 'jsonwebtoken';
import { adminSessionsOps } from './database';
import { logger } from './logger';

// Get JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

// Session configuration
const SESSION_CONFIG = {
  maxAge: 24 * 60 * 60, // 24 hours in seconds
  inactivityTimeout: 30 * 60, // 30 minutes in seconds
  cookieName: 'admin_token',
  renewThreshold: 15 * 60, // 15 minutes in seconds (renew if less than this time left)
};

/**
 * Create a new session for a user
 * @param {Object} user - User object
 * @param {string} ipAddress - Client IP address
 * @param {string} userAgent - Client user agent string
 * @returns {Object} - Session data including token
 */
export async function createSession(user, ipAddress = 'unknown', userAgent = 'unknown') {
  try {
    // Create JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: SESSION_CONFIG.maxAge + 's' }
    );

    // Calculate expiration time
    const expiresAt = new Date(Date.now() + SESSION_CONFIG.maxAge * 1000);

    // Save session to database with IP and user agent
    await adminSessionsOps.create(user.id, token, expiresAt.toISOString(), ipAddress, userAgent);

    // Log session creation
    logger.info('Session created', { 
      userId: user.id, 
      username: user.username,
      ipAddress,
      userAgent: userAgent.substring(0, 50) // Log truncated user agent to avoid excessive log size
    });

    return {
      token,
      expiresAt,
      maxAge: SESSION_CONFIG.maxAge,
    };
  } catch (error) {
    logger.error('Failed to create session', { 
      userId: user.id, 
      error: error.message,
      ipAddress,
      userAgent: userAgent?.substring(0, 50)
    });
    throw error;
  }
}

/**
 * Validate and potentially renew a session
 * @param {string} token - JWT token
 * @param {Object} request - Next.js request object
 * @returns {Object} - Session data and renewal info
 */
export async function validateSession(token, request) {
  try {
    // Get client IP for logging
    const ip = request.headers.get('x-forwarded-for') || 'unknown';

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      logger.warn('Invalid session token', { ip, error: error.message });
      return { valid: false, reason: 'invalid_token' };
    }

    // Get session from database
    const session = await adminSessionsOps.getByToken(token);
    if (!session) {
      logger.warn('Session not found in database', { ip, userId: decoded.userId });
      return { valid: false, reason: 'session_not_found' };
    }

    // Check if session is expired
    const now = new Date();
    const expiresAt = new Date(session.expires_at);
    if (now >= expiresAt) {
      logger.warn('Session expired', { ip, userId: session.user_id });
      return { valid: false, reason: 'session_expired' };
    }

    // Check if session needs renewal (less than renewThreshold time left)
    const timeLeft = (expiresAt - now) / 1000; // in seconds
    const needsRenewal = timeLeft < SESSION_CONFIG.renewThreshold;

    // Update last activity time
    await adminSessionsOps.updateLastActivity(token);

    return {
      valid: true,
      session,
      needsRenewal,
      timeLeft,
    };
  } catch (error) {
    logger.error('Error validating session', { error: error.message });
    throw error;
  }
}

/**
 * Renew a session by creating a new token and updating the database
 * @param {Object} session - Current session object
 * @param {Object} request - Next.js request object
 * @returns {Object} - New session data
 */
export async function renewSession(session, request) {
  try {
    // Get client IP for logging
    const ip = request.headers.get('x-forwarded-for') || 'unknown';

    // Create new token
    const newToken = jwt.sign(
      { userId: session.user_id, username: session.username },
      JWT_SECRET,
      { expiresIn: SESSION_CONFIG.maxAge + 's' }
    );

    // Calculate new expiration time
    const newExpiresAt = new Date(Date.now() + SESSION_CONFIG.maxAge * 1000);

    // Update session in database
    await adminSessionsOps.updateToken(session.id, newToken, newExpiresAt.toISOString());

    // Log session renewal
    logger.info('Session renewed', { ip, userId: session.user_id });

    return {
      token: newToken,
      expiresAt: newExpiresAt,
      maxAge: SESSION_CONFIG.maxAge,
    };
  } catch (error) {
    logger.error('Failed to renew session', { 
      userId: session.user_id, 
      error: error.message 
    });
    throw error;
  }
}

/**
 * Get all active sessions for a user
 * @param {number} userId - User ID
 * @returns {Array} - List of active sessions
 */
export async function getUserSessions(userId) {
  try {
    const sessions = await adminSessionsOps.getByUserId(userId);
    return sessions;
  } catch (error) {
    logger.error('Failed to get user sessions', { 
      userId, 
      error: error.message 
    });
    throw error;
  }
}

/**
 * Terminate a specific session
 * @param {string} token - Session token to terminate
 * @param {number} userId - User ID (for authorization check)
 * @returns {boolean} - Success status
 */
export async function terminateSession(token, userId) {
  try {
    // Get session to check ownership
    const session = await adminSessionsOps.getByToken(token);
    
    // Only allow termination if session belongs to user or user is admin
    if (session && (session.user_id === userId || isAdmin())) {
      await adminSessionsOps.delete(token);
      logger.info('Session terminated', { 
        userId, 
        sessionUserId: session.user_id,
        sessionId: session.id
      });
      return true;
    }
    
    logger.warn('Unauthorized session termination attempt', { 
      userId, 
      sessionUserId: session?.user_id
    });
    return false;
  } catch (error) {
    logger.error('Failed to terminate session', { 
      userId, 
      error: error.message 
    });
    throw error;
  }
}

/**
 * Terminate all sessions for a user except the current one
 * @param {number} userId - User ID
 * @param {string} currentToken - Current session token to keep
 * @returns {number} - Number of terminated sessions
 */
export async function terminateOtherSessions(userId, currentToken) {
  try {
    const count = await adminSessionsOps.deleteAllExcept(userId, currentToken);
    logger.info('Terminated other sessions', { 
      userId, 
      count 
    });
    return count;
  } catch (error) {
    logger.error('Failed to terminate other sessions', { 
      userId, 
      error: error.message 
    });
    throw error;
  }
}

/**
 * Helper function to check if a user is an admin
 * @returns {boolean} - Whether the user is an admin
 */
async function isAdmin() {
  // This is a placeholder - implement based on your role system
  // For now, we'll assume all users in the admin_users table are admins
  return true;
}

/**
 * Get session configuration
 * @returns {Object} - Session configuration
 */
export function getSessionConfig() {
  return { ...SESSION_CONFIG };
}

