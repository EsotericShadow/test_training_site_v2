import { adminSessionsOps } from './database';
import { logger } from './logger';
import { SignJWT, jwtVerify } from 'jose';

// Import JWT_SECRET from environment variables
const JWT_SECRET = process.env.JWT_SECRET;

// Validate JWT_SECRET exists
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

// Security constants
export const TOKEN_EXPIRY_SECONDS = 2 * 60 * 60; // 2 hours in seconds
const REFRESH_THRESHOLD = 30 * 60 * 1000; // 30 minutes before expiry
const MAX_SESSION_AGE = 24 * 60 * 60 * 1000; // 24 hours max session

// FIXED: More reasonable rate limiting for admin usage
const RATE_LIMIT_WINDOW = 5 * 60 * 1000; // 5 minutes (was 15 minutes)
const MAX_ATTEMPTS = 50; // 50 requests per 5 minutes (was 5 per 15 minutes)

// In-memory rate limiting store (use Redis in production)
const rateLimitStore = new Map();

/**
 * Generate a secure device fingerprint (Edge Runtime compatible)
 */
function generateFingerprint(request) {
  const userAgent = request.headers.get('user-agent') || '';
  const acceptLanguage = request.headers.get('accept-language') || '';
  const acceptEncoding = request.headers.get('accept-encoding') || '';
  
  // Use btoa instead of crypto for Edge Runtime compatibility
  const fingerprint = btoa(userAgent + acceptLanguage + acceptEncoding)
    .replace(/[^a-zA-Z0-9]/g, '')
    .substring(0, 32);
    
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
 * Create a simple hash (Edge Runtime compatible)
 */
async function simpleHash(input) {
  const textEncoder = new TextEncoder();
  const data = textEncoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hexHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hexHash.substring(0, 16); // First 16 chars
}

/**
 * Generate unique ID with enhanced uniqueness (Edge Runtime compatible)
 */
function generateUniqueId() {
  // FIXED: Enhanced uniqueness to prevent duplicate tokens
  const timestamp = Date.now().toString(36);
  const random1 = Math.random().toString(36).substring(2);
  const random2 = Math.random().toString(36).substring(2);
  const random3 = Math.random().toString(36).substring(2);
  
  // Combine multiple random sources for better uniqueness
  return timestamp + random1 + random2 + random3;
}

/**
 * Rate limiting check - FIXED for admin usage
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
 * Generate secure JWT token with enhanced claims and uniqueness
 */
async function generateSecureToken(user, request) {
  const now = Date.now();
  const ipAddress = getClientIP(request);
  const deviceFingerprint = generateFingerprint(request);
  
  // FIXED: Enhanced payload with better uniqueness
  const enhancedPayload = {
    userId: user.id,
    username: user.username,
    email: user.email,
    iat: Math.floor(now / 1000),
    iss: 'karma-training-cms',
    aud: 'admin-panel',
    jti: generateUniqueId(), // Enhanced unique token ID
    
    // Security claims for anti-hijacking
    ipHash: await simpleHash(ipAddress),
    deviceFingerprint: deviceFingerprint,
    securityLevel: 'enhanced',
    
    // Additional uniqueness factors
    sessionStart: now,
    randomSalt: Math.random().toString(36).substring(2, 15)
  };

  const secret = new TextEncoder().encode(JWT_SECRET);
  
  // Generate token with jose
  return new SignJWT(enhancedPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${TOKEN_EXPIRY_SECONDS}s`)
    .sign(secret);
}

/**
 * Verify and validate secure JWT token
 */
async function verifySecureToken(token, request) {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    
    // Verify JWT signature and expiration with jose
    const { payload: decoded } = await jwtVerify(token, secret, {
      algorithms: ['HS256'],
      issuer: 'karma-training-cms',
      audience: 'admin-panel',
    });
    
    // Enhanced security validation
    const currentIP = getClientIP(request);
    const currentFingerprint = generateFingerprint(request);
    
    // Check IP binding (anti-hijacking)
    if (decoded.ipHash && decoded.ipHash !== await simpleHash(currentIP)) {
      logger.warn('Token IP mismatch detected', {
        tokenIP: decoded.ipHash,
        currentIP: await simpleHash(currentIP),
        userId: decoded.userId
      });
      
      return {
        valid: false,
        reason: 'IP address mismatch - possible token hijacking',
        securityViolation: true
      };
    }
    
    // Check device fingerprint (anti-hijacking)
    if (decoded.deviceFingerprint && decoded.deviceFingerprint !== currentFingerprint) {
      logger.warn('Token device fingerprint mismatch detected', {
        tokenFingerprint: decoded.deviceFingerprint,
        currentFingerprint: currentFingerprint,
        userId: decoded.userId
      });
      
      return {
        valid: false,
        reason: 'Device fingerprint mismatch - possible token hijacking',
        securityViolation: true
      };
    }
    
    // Check if token needs renewal (within refresh threshold)
    const timeUntilExpiry = (decoded.exp * 1000) - Date.now();
    const needsRenewal = timeUntilExpiry < REFRESH_THRESHOLD;
    
    return {
      valid: true,
      decoded: decoded,
      needsRenewal: needsRenewal,
      timeLeft: timeUntilExpiry,
      securityLevel: decoded.securityLevel || 'legacy'
    };
    
  } catch (error) {
    if (error.code === 'ERR_JWT_EXPIRED') {
      return {
        valid: false,
        reason: 'Token expired',
        expired: true
      };
    } else if (error.code === 'ERR_JWS_INVALID' || error.code === 'ERR_JWT_INVALID') {
      return {
        valid: false,
        reason: 'Invalid token signature',
        securityViolation: true
      };
    } else {
      logger.error('Token verification error', { error: error.message });
      return {
        valid: false,
        reason: 'Token verification failed'
      };
    }
  }
}

/**
 * Authenticate request with enhanced security
 */
async function authenticateSecure(request) {
  const ipAddress = getClientIP(request);
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  // Rate limiting check
  const rateLimitResult = checkRateLimit(ipAddress);
  if (!rateLimitResult.allowed) {
    logger.warn('Rate limit exceeded', {
      ip: ipAddress,
      userAgent: userAgent.substring(0, 50), // FIXED: Use userAgent in logging
      remaining: rateLimitResult.remaining,
      resetTime: new Date(rateLimitResult.resetTime).toISOString()
    });
    
    return {
      success: false,
      error: 'Too many requests',
      status: 429,
      headers: {
        'X-RateLimit-Limit': MAX_ATTEMPTS.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': Math.ceil(rateLimitResult.resetTime / 1000).toString()
      }
    };
  }
  
  // Extract token from cookie
  const token = request.cookies.get('admin_token')?.value;
  
  if (!token) {
    logger.warn('Authentication failed: No token provided', { 
      ip: ipAddress,
      userAgent: userAgent.substring(0, 50) // FIXED: Use userAgent in logging
    });
    return {
      success: false,
      error: 'Authentication required',
      status: 401
    };
  }
  
  // Verify token
  const tokenResult = await verifySecureToken(token, request);
  
  if (!tokenResult.valid) {
    logger.warn('Authentication failed: Invalid token', {
      ip: ipAddress,
      userAgent: userAgent.substring(0, 50), // FIXED: Use userAgent in logging
      reason: tokenResult.reason,
      securityViolation: tokenResult.securityViolation
    });
    
    return {
      success: false,
      error: tokenResult.reason || 'Invalid authentication',
      status: 401
    };
  }
  
  // Validate session exists in database
  try {
    const session = await adminSessionsOps.getByToken(token);
    
    if (!session) {
      logger.warn('Authentication failed: Session not found in database', {
        ip: ipAddress,
        userAgent: userAgent.substring(0, 50), // FIXED: Use userAgent in logging
        userId: tokenResult.decoded.userId
      });
      
      return {
        success: false,
        error: 'Session not found',
        status: 401
      };
    }
    
    // Check session expiration
    if (new Date(session.expires_at) < new Date()) {
      logger.warn('Authentication failed: Session expired', {
        ip: ipAddress,
        userAgent: userAgent.substring(0, 50), // FIXED: Use userAgent in logging
        userId: tokenResult.decoded.userId,
        expiresAt: session.expires_at
      });
      
      return {
        success: false,
        error: 'Session expired',
        status: 401
      };
    }
    
    // Check maximum session age
    const sessionAge = Date.now() - new Date(session.created_at).getTime();
    if (sessionAge > MAX_SESSION_AGE) {
      logger.warn('Authentication failed: Session too old', {
        ip: ipAddress,
        userAgent: userAgent.substring(0, 50), // FIXED: Use userAgent in logging
        userId: tokenResult.decoded.userId,
        sessionAge: sessionAge
      });
      
      return {
        success: false,
        error: 'Session expired due to age',
        status: 401
      };
    }
    
    logger.info('Authentication successful', {
      ip: ipAddress,
      userAgent: userAgent.substring(0, 50), // FIXED: Use userAgent in logging
      userId: tokenResult.decoded.userId,
      securityLevel: tokenResult.securityLevel,
      needsRenewal: tokenResult.needsRenewal
    });
    
    return {
      success: true,
      user: {
        id: tokenResult.decoded.userId,
        username: tokenResult.decoded.username,
        email: tokenResult.decoded.email
      },
      session: session,
      needsRenewal: tokenResult.needsRenewal,
      timeLeft: tokenResult.timeLeft,
      securityLevel: tokenResult.securityLevel,
      headers: {
        'X-RateLimit-Limit': MAX_ATTEMPTS.toString(),
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': Math.ceil(rateLimitResult.resetTime / 1000).toString()
      }
    };
    
  } catch (error) {
    logger.error('Database error during authentication', {
      error: error.message,
      ip: ipAddress,
      userAgent: userAgent.substring(0, 50) // FIXED: Use userAgent in logging
    });
    
    return {
      success: false,
      error: 'Authentication service error',
      status: 500
    };
  }
}

/**
 * Automatic token refresh
 */
async function refreshTokenIfNeeded(authResult, request) {
  if (!authResult.needsRenewal) {
    return null; // No refresh needed
  }
  
  try {
    // Generate new token
    const newToken = await generateSecureToken(authResult.user, request);
    const expiresAt = new Date(Date.now() + (2 * 60 * 60 * 1000)); // 2 hours
    
    // Update session in database
    await adminSessionsOps.updateToken(authResult.session.id, newToken, expiresAt);
    
    logger.info('Token refreshed successfully', {
      userId: authResult.user.id,
      sessionId: authResult.session.id
    });
    
    return {
      token: newToken,
      expiresAt: expiresAt,
      maxAge: 2 * 60 * 60 // 2 hours in seconds
    };
    
  } catch (error) {
    logger.error('Token refresh failed', {
      error: error.message,
      userId: authResult.user.id
    });
    return null;
  }
}

/**
 * Add security headers to response
 */
function addSecurityHeaders(response) {
  // XSS Protection
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // CSRF Protection
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy
  response.headers.set('Content-Security-Policy', 
    "default-src 'self'; script-src 'self' 'unsafe-inline'; script-src-elem 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
  );
  
  // HTTPS enforcement
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  return response;
}

/**
 * Higher-order function to wrap API routes with secure authentication
 */
function withSecureAuth(handler) {
  return async function(request, context) {
    try {
      // Authenticate request
      const authResult = await authenticateSecure(request);
      
      if (!authResult.success) {
        let response = new Response(
          JSON.stringify({ error: authResult.error }),
          { 
            status: authResult.status,
            headers: { 'Content-Type': 'application/json' }
          }
        );
        
        // Add rate limiting headers if present
        if (authResult.headers) {
          Object.entries(authResult.headers).forEach(([key, value]) => {
            response.headers.set(key, value);
          });
        }
        
        return addSecurityHeaders(response);
      }
      
      // Check for token refresh
      const refreshData = await refreshTokenIfNeeded(authResult, request);
      
      // Call the original handler with auth context
      const result = await handler(request, {
        ...context,
        auth: {
          user: authResult.user,
          session: authResult.session,
          securityLevel: authResult.securityLevel
        }
      });
      
      // Handle token refresh
      if (refreshData) {
        result.cookies.set('admin_token', refreshData.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: refreshData.maxAge
        });
        
        // Add refresh indicator header
        result.headers.set('X-Token-Refreshed', 'true');
      }
      
      // Add rate limiting headers
      if (authResult.headers) {
        Object.entries(authResult.headers).forEach(([key, value]) => {
          result.headers.set(key, value);
        });
      }
      
      return addSecurityHeaders(result);
      
    } catch (error) {
      logger.error('Secure auth wrapper error', { error: error.message });
      
      const response = new Response(
        JSON.stringify({ error: 'Authentication service error' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
      
      return addSecurityHeaders(response);
    }
  };
}

/**
 * Secure logout function
 */
async function secureLogout(request) {
  try {
    const token = request.cookies.get('admin_token')?.value;
    
    if (token) {
      // Remove session from database
      await adminSessionsOps.deleteByToken(token);
      
      logger.info('Secure logout completed', {
        ip: getClientIP(request)
      });
    }
    
    return {
      success: true
    };
    
  } catch (error) {
    logger.error('Secure logout error', { error: error.message });
    return {
      success: false,
      error: 'Logout failed'
    };
  }
}

// Named exports for direct importing (maintains compatibility)
const generateSecureToken_export = generateSecureToken;
const verifySecureToken_export = verifySecureToken;
const authenticateSecure_export = authenticateSecure;
const withSecureAuth_export = withSecureAuth;
const secureLogout_export = secureLogout;
const getClientIP_export = getClientIP;
const generateFingerprint_export = generateFingerprint;
const checkRateLimit_export = checkRateLimit;

export {
  generateSecureToken_export as generateSecureToken,
  verifySecureToken_export as verifySecureToken,
  authenticateSecure_export as authenticateSecure,
  withSecureAuth_export as withSecureAuth,
  secureLogout_export as secureLogout,
  getClientIP_export as getClientIP,
  generateFingerprint_export as generateFingerprint,
  checkRateLimit_export as checkRateLimit
};

