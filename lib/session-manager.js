// lib/session-manager.js
import { generateSecureToken, verifySecureToken, TOKEN_EXPIRY_SECONDS } from './secure-jwt';
import { adminSessionsOps } from './database';
import { logger } from './logger';

// Session configuration
const SESSION_CONFIG = {
  maxAge: 24 * 60 * 60, // 24 hours in seconds
  inactivityTimeout: 30 * 60, // 30 minutes in seconds
  cookieName: 'admin_token',
  renewThreshold: 15 * 60, // 15 minutes in seconds (renew if less than this time left)
};

/**
 * Create a new session for a user with enhanced security
 * @param {Object} user - User object
 * @param {string} ipAddress - Client IP address
 * @param {string} userAgent - Client user agent string
 * @returns {Object} - Session data including token
 */
async function createSession(user, ipAddress = 'unknown', userAgent = 'unknown') {
  try {
    // Create a mock request object for secure token generation
    const mockRequest = {
      headers: {
        get: (name) => {
          switch (name) {
            case 'x-forwarded-for':
            case 'x-real-ip':
              return ipAddress;
            case 'user-agent':
              return userAgent;
            case 'accept-language':
              return 'en-US,en;q=0.9';
            case 'accept-encoding':
              return 'gzip, deflate, br';
            default:
              return null;
          }
        }
      }
    };

    // FIXED: Generate secure token with IP binding and device fingerprinting (added await)
    const token = await generateSecureToken({
      id: user.id,
      userId: user.id, // Keep for backward compatibility
      username: user.username,
      email: user.email
    }, mockRequest);

    // Calculate expiration time (2 hours for secure tokens)
    const expiresAt = new Date(Date.now() + (TOKEN_EXPIRY_SECONDS * 1000)); // Use TOKEN_EXPIRY_SECONDS

    // FIXED: Save session to database with individual parameters instead of object
    await adminSessionsOps.create(
      user.id,                              // userId
      token,                                // token
      expiresAt.toISOString(),             // expiresAt
      ipAddress,                            // ipAddress
      userAgent.substring(0, 255)          // userAgent (truncated)
    );

    // Log session creation
    logger.info('Enhanced session created', { 
      userId: user.id, 
      username: user.username,
      ipAddress,
      userAgent: userAgent.substring(0, 50),
      securityLevel: 'enhanced'
    });

    return {
      token,
      expiresAt,
      maxAge: TOKEN_EXPIRY_SECONDS, // Use TOKEN_EXPIRY_SECONDS
    };
  } catch (error) {
    logger.error('Failed to create enhanced session', { 
      userId: user.id, 
      error: error.message,
      ipAddress,
      userAgent: userAgent?.substring(0, 50)
    });
    throw error;
  }
}

/**
 * Validate and potentially renew a session with enhanced security
 * @param {string} token - JWT token
 * @param {Object} request - Next.js request object
 * @returns {Object} - Session data and renewal info
 */
async function validateSession(token, request) {
  try {
    // Get client IP for logging
    const ip = request.headers.get('x-forwarded-for') || 'unknown';

    // FIXED: Verify token with enhanced security checks (added await)
    const tokenResult = await verifySecureToken(token, request);
    if (!tokenResult.valid) {
      logger.warn('Enhanced session validation failed', { 
        ip, 
        reason: tokenResult.reason || 'invalid_token',
        securityLevel: 'enhanced'
      });
      return { valid: false, reason: tokenResult.reason || 'invalid_token' };
    }

    const decoded = tokenResult.decoded;

    // Get session from database
    const session = await adminSessionsOps.getByToken(token);
    if (!session) {
      logger.warn('Session not found in database', { ip, userId: decoded.id });
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
    const needsRenewal = tokenResult.needsRenewal || timeLeft < SESSION_CONFIG.renewThreshold;

    // Update last activity time
    await adminSessionsOps.updateLastActivity(token);

    // Add enhanced session data for compatibility
    const enhancedSession = {
      ...session,
      username: decoded.username,
      email: decoded.email
    };

    return {
      valid: true,
      session: enhancedSession,
      needsRenewal,
      timeLeft,
      securityLevel: 'enhanced'
    };
  } catch (error) {
    logger.error('Error validating enhanced session', { error: error.message });
    return { valid: false, reason: 'validation_error' };
  }
}

/**
 * Renew a session by creating a new secure token and updating the database
 * @param {Object} session - Current session object
 * @param {Object} request - Next.js request object
 * @returns {Object} - New session data
 */
async function renewSession(session, request) {
  try {
    // Get client IP for logging
    const ip = request.headers.get('x-forwarded-for') || 'unknown';

    // FIXED: Generate new secure token (added await)
    const newToken = await generateSecureToken({
      id: session.user_id,
      userId: session.user_id, // Keep for backward compatibility
      username: session.username,
      email: session.email
    }, request);

    // Calculate new expiration time (2 hours for secure tokens)
    const newExpiresAt = new Date(Date.now() + (TOKEN_EXPIRY_SECONDS * 1000));

    // Update session in database
    await adminSessionsOps.updateToken(session.id, newToken, newExpiresAt.toISOString());

    // Log session renewal
    logger.info('Enhanced session renewed', { 
      ip, 
      userId: session.user_id,
      securityLevel: 'enhanced'
    });

    return {
      token: newToken,
      expiresAt: newExpiresAt,
      maxAge: TOKEN_EXPIRY_SECONDS, // 2 hours for secure tokens
    };
  } catch (error) {
    logger.error('Failed to renew enhanced session', { 
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
async function getUserSessions(userId) {
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
 * @param {string} sessionId - Session ID to terminate
 * @param {number} userId - User ID (for authorization check)
 * @returns {boolean} - Success status
 */
async function terminateSession(sessionId, userId) {
  try {
    // Get session to check ownership
    const session = await adminSessionsOps.getById(Number(sessionId));
    
    // Only allow termination if session belongs to user
    if (session && session.user_id === userId) {
      await adminSessionsOps.deleteById(Number(sessionId));
      logger.info('Enhanced session terminated', { 
        userId, 
        sessionId: sessionId,
        securityLevel: 'enhanced'
      });
      return true;
    }
    
    logger.warn('Unauthorized session termination attempt', { 
      userId, 
      sessionId,
      sessionUserId: session?.user_id
    });
    return false;
  } catch (error) {
    logger.error('Failed to terminate session', { 
      userId, 
      sessionId,
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
async function terminateOtherSessions(userId, currentToken) {
  try {
    const count = await adminSessionsOps.deleteAllExcept(userId, currentToken);
    logger.info('Terminated other enhanced sessions', { 
      userId, 
      count,
      securityLevel: 'enhanced'
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
 * Get session configuration
 * @returns {Object} - Session configuration
 */
function getSessionConfig() {
  return { 
    ...SESSION_CONFIG,
    securityLevel: 'enhanced',
    features: ['ip_binding', 'device_fingerprinting', 'rate_limiting']
  };
}

// Log enhanced session manager initialization
console.log('Enhanced session manager loaded with secure JWT integration');

// Export all functions for compatibility
export {
  createSession,
  validateSession,
  renewSession,
  getUserSessions,
  terminateSession,
  terminateOtherSessions,
  getSessionConfig
};

