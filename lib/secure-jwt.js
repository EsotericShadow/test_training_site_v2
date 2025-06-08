import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { adminSessionsOps } from './database';
import { logger } from './logger';

// Fail hard if JWT_SECRET is not set - no fallback for security
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be set and at least 32 characters long');
}

// Security constants
const TOKEN_EXPIRY = '2h'; // Short-lived tokens
const REFRESH_THRESHOLD = 30 * 60 * 1000; // 30 minutes before expiry
const MAX_SESSION_AGE = 24 * 60 * 60 * 1000; // 24 hours max session
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5; // Max auth attempts per window

// In-memory rate limiting store (use Redis in production)
const rateLimitStore = new Map();

/**
 * Generate a secure device fingerprint
 */
function generateFingerprint(request) {
  const userAgent = request.headers.get('user-agent') || '';
  const acceptLanguage = request.headers.get('accept-language') || '';
  const acceptEncoding = request.headers.get('accept-encoding') || '';
  
  const fingerprint = crypto
    .createHash('sha256')
    .update(userAgent + acceptLanguage + acceptEncoding)
    .digest('hex');
    
  return fingerprint.substring(0, 16); // First 16 chars
}

/**
 * Get client IP address with proper proxy handling
 */
function getClientIP(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const remoteAddr = request.headers.get('x-remote-addr');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  return realIP || remoteAddr || 'unknown';
}

/**
 * Rate limiting check
 */
function checkRateLimit(identifier) {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;
  
  // Clean old entries
  for (const [key, data] of rateLimitStore.entries()) {
    if (data.timestamp < windowStart) {
      rateLimitStore.delete(key);
    }
  }
  
  const attempts = rateLimitStore.get(identifier) || { count: 0, timestamp: now };
  
  if (attempts.timestamp < windowStart) {
    // Reset counter for new window
    attempts.count = 1;
    attempts.timestamp = now;
  } else {
    attempts.count++;
  }
  
  rateLimitStore.set(identifier, attempts);
  
  return {
    allowed: attempts.count <= MAX_ATTEMPTS,
    remaining: Math.max(0, MAX_ATTEMPTS - attempts.count),
    resetTime: attempts.timestamp + RATE_LIMIT_WINDOW
  };
}

/**
 * Generate secure JWT token with enhanced claims
 */
function generateSecureToken(payload, request) {
  const now = Date.now();
  const ip = getClientIP(request);
  const fingerprint = generateFingerprint(request);
  
  const enhancedPayload = {
    ...payload,
    iat: Math.floor(now / 1000),
    exp: Math.floor((now + (2 * 60 * 60 * 1000)) / 1000), // 2 hours
    ip: crypto.createHash('sha256').update(ip).digest('hex').substring(0, 16),
    fp: fingerprint, // Device fingerprint
    jti: crypto.randomUUID(), // Unique token ID
    iss: 'karma-cms', // Issuer
    aud: 'admin-panel' // Audience
  };
  
  return jwt.sign(enhancedPayload, JWT_SECRET, { 
    algorithm: 'HS256',
    expiresIn: TOKEN_EXPIRY // Now using the TOKEN_EXPIRY constant
  });
}

/**
 * Verify JWT token with enhanced security checks
 */
function verifySecureToken(token, request) {
  try {
    // Verify JWT signature and basic claims
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: 'karma-cms',
      audience: 'admin-panel'
    });
    
    const now = Date.now();
    const ip = getClientIP(request);
    const fingerprint = generateFingerprint(request);
    const hashedIP = crypto.createHash('sha256').update(ip).digest('hex').substring(0, 16);
    
    // Enhanced security validations
    const validations = {
      expired: decoded.exp * 1000 < now,
      ipMismatch: decoded.ip !== hashedIP,
      fingerprintMismatch: decoded.fp !== fingerprint,
      tooOld: (now - (decoded.iat * 1000)) > MAX_SESSION_AGE,
      needsRefresh: (decoded.exp * 1000 - now) < REFRESH_THRESHOLD
    };
    
    // Log security violations
    if (validations.ipMismatch) {
      logger.warn('Token IP mismatch detected', { 
        tokenIP: decoded.ip, 
        requestIP: hashedIP,
        userId: decoded.id 
      });
    }
    
    if (validations.fingerprintMismatch) {
      logger.warn('Token fingerprint mismatch detected', { 
        tokenFP: decoded.fp, 
        requestFP: fingerprint,
        userId: decoded.id 
      });
    }
    
    return {
      valid: !validations.expired && !validations.ipMismatch && 
             !validations.fingerprintMismatch && !validations.tooOld,
      decoded,
      validations,
      needsRefresh: validations.needsRefresh
    };
    
  } catch (error) {
    logger.warn('JWT verification failed', { error: error.message });
    return {
      valid: false,
      error: error.message
    };
  }
}

/**
 * Secure authentication middleware with rate limiting
 */
async function authenticateSecure(request) {
  try {
    const ip = getClientIP(request);
    const identifier = `auth:${ip}`;
    
    // Check rate limiting
    const rateLimit = checkRateLimit(identifier);
    if (!rateLimit.allowed) {
      logger.warn('Rate limit exceeded', { ip, remaining: rateLimit.remaining });
      return {
        success: false,
        error: 'Too many authentication attempts. Please try again later.',
        status: 429,
        headers: {
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString()
        }
      };
    }
    
    // Extract token
    const token = request.cookies.get('admin_token')?.value;
    if (!token) {
      return {
        success: false,
        error: 'Authentication required',
        status: 401
      };
    }
    
    // Verify token with enhanced security
    const tokenResult = verifySecureToken(token, request);
    if (!tokenResult.valid) {
      return {
        success: false,
        error: 'Invalid or expired token',
        status: 401
      };
    }
    
    // Validate session in database
    const session = await adminSessionsOps.getByToken(token);
    if (!session) {
      logger.warn('Session not found in database', { 
        userId: tokenResult.decoded.id,
        ip 
      });
      return {
        success: false,
        error: 'Session not found',
        status: 401
      };
    }
    
    // Check if session is expired
    if (session.expires_at && new Date() > new Date(session.expires_at)) {
      logger.warn('Database session expired', { 
        userId: tokenResult.decoded.id,
        ip 
      });
      return {
        success: false,
        error: 'Session expired',
        status: 401
      };
    }
    
    // Log successful authentication
    logger.info('Secure authentication successful', {
      userId: tokenResult.decoded.id,
      ip,
      needsRefresh: tokenResult.needsRefresh
    });
    
    return {
      success: true,
      user: tokenResult.decoded,
      session,
      token,
      needsRefresh: tokenResult.needsRefresh,
      headers: {
        'X-RateLimit-Remaining': rateLimit.remaining.toString()
      }
    };
    
  } catch (error) {
    logger.error('Authentication error', { error: error.message });
    return {
      success: false,
      error: 'Authentication failed',
      status: 500
    };
  }
}

/**
 * Secure wrapper for API routes with automatic token refresh
 */
function withSecureAuth(handler) {
  return async function(request, ...args) {
    const authResult = await authenticateSecure(request);
    
    if (!authResult.success) {
      const response = new Response(
        JSON.stringify({ error: authResult.error }),
        { 
          status: authResult.status,
          headers: {
            'Content-Type': 'application/json',
            ...authResult.headers
          }
        }
      );
      
      // Add security headers
      response.headers.set('X-Content-Type-Options', 'nosniff');
      response.headers.set('X-Frame-Options', 'DENY');
      response.headers.set('X-XSS-Protection', '1; mode=block');
      
      return response;
    }
    
    // Add auth info to request
    request.auth = authResult;
    
    // Call the actual handler
    const handlerResponse = await handler(request, ...args);
    
    // Handle token refresh if needed
    if (authResult.needsRefresh && handlerResponse.ok) {
      const newToken = generateSecureToken({
        id: authResult.user.id,
        username: authResult.user.username,
        email: authResult.user.email
      }, request);
      
      // Update session in database with new token
      await adminSessionsOps.updateToken(authResult.session.id, newToken);
      
      // Set new token in cookie
      handlerResponse.cookies.set('admin_token', newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 2 * 60 * 60 // 2 hours
      });
      
      logger.info('Token refreshed automatically', { 
        userId: authResult.user.id 
      });
    }
    
    // Add security headers to all responses
    handlerResponse.headers.set('X-Content-Type-Options', 'nosniff');
    handlerResponse.headers.set('X-Frame-Options', 'DENY');
    handlerResponse.headers.set('X-XSS-Protection', '1; mode=block');
    handlerResponse.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    
    return handlerResponse;
  };
}

/**
 * Logout and invalidate session
 */
async function secureLogout(token) {
  try {
    if (token) {
      await adminSessionsOps.deleteByToken(token);
      logger.info('Session invalidated during logout');
    }
    return { success: true };
  } catch (error) {
    logger.error('Logout error', { error: error.message });
    return { success: false, error: 'Logout failed' };
  }
}


// Named exports for direct importing (maintains compatibility)
export {
  generateSecureToken,
  verifySecureToken,
  authenticateSecure,
  withSecureAuth,
  secureLogout
};

// Default export object for convenience and organization
const secureJwt = {
  // Main authentication functions
  generateToken: generateSecureToken,
  verifyToken: verifySecureToken,
  authenticate: authenticateSecure,
  withAuth: withSecureAuth,
  logout: secureLogout,
  
  // Utility functions for advanced usage
  utils: {
    getClientIP,
    generateFingerprint,
    checkRateLimit
  }
};

export default secureJwt;

