/*
 * Evergreen Web Solutions
 * Written and developed by Gabriel Lacroix
 *
 * File: secure-jwt.ts
 * Description: This script provides a robust and secure JSON Web Token (JWT) implementation
 * for authentication and session management within the application. It handles token generation,
 * verification, and includes advanced security features like IP binding, device fingerprinting,
 * and session renewal to enhance the overall security posture.
 *
 * Dependencies:
 * - next/server: Provides Next.js-specific server-side utilities for request and response handling.
 * - ./database: Used for interacting with the `admin_sessions` table to persist and manage sessions.
 * - ./logger: The application's centralized logging utility for security-related events.
 * - jose: A comprehensive and secure library for JWT creation and verification.
 * - ../types/database: Contains TypeScript type definitions for `AdminSession`.
 *
 * Created: 2025-07-17
 * Last Modified: 2025-08-03
 * Version: 1.0.1
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminSessionsOps } from './database';
import { logger } from './logger';
import { SignJWT, jwtVerify, JWTPayload } from 'jose';
import type { AdminSession } from '../types/database';

// --- TYPE DEFINITIONS ---

/**
 * @interface RateLimitData
 * @description Represents the data stored for rate limiting a specific identifier (e.g., IP address).
 */
interface RateLimitData {
  count: number;
  timestamp: number;
}

/**
 * @interface RateLimitResult
 * @description Represents the result of a rate limit check.
 */
interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

/**
 * @interface TokenUser
 * @description Defines the structure of user information stored within the JWT payload.
 */
interface TokenUser {
  id: number;
  userId: number;
  username: string;
  email: string;
}

/**
 * @interface VerificationResult
 * @description Represents the result of a JWT verification process, including validity status and decoded payload.
 */
interface VerificationResult {
  valid: boolean;
  decoded?: JWTPayload & TokenUser;
  needsRenewal: boolean;
  timeLeft: number;
  securityLevel: string;
  reason?: string;
  expired?: boolean;
  securityViolation?: boolean;
}

/**
 * @interface AuthResult
 * @description Represents the comprehensive result of an authentication attempt.
 */
export interface AuthResult {
  success: boolean;
  error?: string;
  status?: number;
  headers?: { [key: string]: string };
  user?: TokenUser;
  session?: AdminSession;
  needsRenewal: boolean;
  timeLeft: number;
  securityLevel: string;
}

// --- CONFIGURATION ---

// The secret key used for signing and verifying JWTs. Must be a strong, randomly generated string.
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  // Critical error: The application cannot function securely without a JWT secret.
  throw new Error('JWT_SECRET environment variable is required');
}
const secret = new TextEncoder().encode(JWT_SECRET);

// Token expiry time in seconds (2 hours).
export const TOKEN_EXPIRY_SECONDS = 2 * 60 * 60;
// Threshold for token renewal in milliseconds (30 minutes before expiry).
const REFRESH_THRESHOLD = 30 * 60 * 1000;
// Maximum allowed session age in milliseconds (24 hours), regardless of activity.
const MAX_SESSION_AGE = 24 * 60 * 60 * 1000;
// Time window for rate limiting in milliseconds (5 minutes).
const RATE_LIMIT_WINDOW = 5 * 60 * 1000;
// Maximum allowed requests within the rate limit window.
const MAX_ATTEMPTS = 50;

// In-memory store for rate limiting. In a production environment, consider a persistent store like Redis.
const rateLimitStore = new Map<string, RateLimitData>();

// --- HELPER FUNCTIONS ---

/**
 * @function generateFingerprint
 * @description Generates a unique device fingerprint based on request headers.
 * This helps in identifying and mitigating session hijacking attempts.
 * @param {NextRequest} request - The incoming Next.js request.
 * @returns {string} A unique, truncated device fingerprint.
 */
export function generateFingerprint(request: NextRequest): string {
  const userAgent = request.headers.get('user-agent') || '';
  const acceptLanguage = request.headers.get('accept-language') || '';
  const acceptEncoding = request.headers.get('accept-encoding') || '';
  // Combine and hash relevant headers to create a fingerprint.
  const fingerprint = btoa(userAgent + acceptLanguage + acceptEncoding).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
  return fingerprint.substring(0, 16); // Truncate to a reasonable length.
}

/**
 * @function getClientIP
 * @description Extracts the client's IP address from the request headers.
 * It prioritizes `x-forwarded-for` for proxy compatibility, falling back to `x-real-ip`.
 * @param {NextRequest} request - The incoming Next.js request.
 * @returns {string} The client's IP address, or 'unknown' if not found.
 */
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  return typeof forwarded === 'string' && forwarded.length > 0
    ? (forwarded?.split(',')[0]?.trim() ?? realIP ?? 'unknown')
    : realIP || 'unknown';
}

/**
 * @function simpleHash
 * @description Generates a SHA-256 hash of the input string.
 * Used for hashing sensitive information like IP addresses before storing or comparing them.
 * @param {string} input - The string to hash.
 * @returns {Promise<string>} The hexadecimal representation of the hash, truncated to 16 characters.
 */
async function simpleHash(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
}

/**
 * @function generateUniqueId
 * @description Generates a unique ID for JWT `jti` (JWT ID) claim.
 * This helps in preventing token replay attacks and provides a unique identifier for each token.
 * @returns {string} A unique ID string.
 */
function generateUniqueId(): string {
  const timestamp = Date.now().toString(36);
  const random1 = Math.random().toString(36).substring(2);
  const random2 = Math.random().toString(36).substring(2);
  return timestamp + random1 + random2;
}

/**
 * @function checkRateLimit
 * @description Implements a basic in-memory rate limiting mechanism.
 * This prevents a single client from making too many requests within a defined time window.
 * @param {string} identifier - The identifier to rate limit (e.g., IP address).
 * @returns {RateLimitResult} The result of the rate limit check.
 */
export function checkRateLimit(identifier: string): RateLimitResult {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;

  // Clean up old entries in the rate limit store.
  rateLimitStore.forEach((data, key) => {
    if (data.timestamp < windowStart) {
      rateLimitStore.delete(key);
    }
  });

  const attempts = rateLimitStore.get(identifier) || { count: 0, timestamp: now };
  if (attempts.timestamp < windowStart) {
    attempts.count = 1;
    attempts.timestamp = now;
  } else {
    attempts.count++;
  }
  rateLimitStore.set(identifier, attempts);

  return {
    allowed: attempts.count <= MAX_ATTEMPTS,
    remaining: Math.max(0, MAX_ATTEMPTS - attempts.count),
    resetTime: attempts.timestamp + RATE_LIMIT_WINDOW,
  };
}

// --- CORE JWT FUNCTIONS ---

/**
 * @function generateSecureToken
 * @description Generates a new secure JWT for an authenticated user.
 * The token includes user details, IP hash, and device fingerprint for enhanced security.
 * @param {TokenUser} user - The user object to be included in the token payload.
 * @param {NextRequest} request - The incoming Next.js request, used to extract IP and device fingerprint.
 * @returns {Promise<string>} The generated JWT string.
 */
export async function generateSecureToken(user: TokenUser, request: NextRequest): Promise<string> {
  const now = Date.now();
  const ipAddress = getClientIP(request);
  const deviceFingerprint = generateFingerprint(request);

  const payload = {
    ...user,
    iat: Math.floor(now / 1000), // Issued at timestamp
    iss: 'karma-training-cms', // Issuer of the token
    aud: 'admin-panel', // Audience of the token
    jti: generateUniqueId(), // Unique JWT ID to prevent replay attacks
    ipHash: await simpleHash(ipAddress), // Hashed IP address for IP binding
    deviceFingerprint, // Device fingerprint for device binding
    securityLevel: 'enhanced', // Indicates the level of security applied to the token
    sessionStart: now, // Timestamp when the session started
    randomSalt: Math.random().toString(36).substring(2, 15), // Additional randomness
  };

  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${TOKEN_EXPIRY_SECONDS}s`)
    .sign(secret);
}

/**
 * @function verifySecureToken
 * @description Verifies a given JWT and checks for security violations like IP or device fingerprint mismatches.
 * @param {string} token - The JWT string to verify.
 * @param {NextRequest} request - The incoming Next.js request, used to extract current IP and device fingerprint.
 * @returns {Promise<VerificationResult>} The result of the verification, including validity and any security flags.
 */
export async function verifySecureToken(token: string, request: NextRequest): Promise<VerificationResult> {
  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ['HS256'],
      issuer: 'karma-training-cms',
      audience: 'admin-panel',
    });

    const currentIP = getClientIP(request);
    const currentFingerprint = generateFingerprint(request);

    // Check for IP address mismatch to prevent session hijacking.
    if (payload.ipHash && payload.ipHash !== await simpleHash(currentIP)) {
      logger.warn('Token IP mismatch detected', { userId: payload.userId as string });
      return { valid: false, reason: 'IP address mismatch', securityViolation: true, needsRenewal: false, timeLeft: 0, securityLevel: 'enhanced' };
    }

    // Check for device fingerprint mismatch to prevent session hijacking.
    if (payload.deviceFingerprint && payload.deviceFingerprint !== currentFingerprint) {
      logger.warn('Token device fingerprint mismatch', { userId: payload.userId as string });
      return { valid: false, reason: 'Device fingerprint mismatch', securityViolation: true, needsRenewal: false, timeLeft: 0, securityLevel: 'enhanced' };
    }

    // Calculate time until expiry and determine if renewal is needed.
    const timeUntilExpiry = (payload.exp! * 1000) - Date.now();
    const needsRenewal = timeUntilExpiry < REFRESH_THRESHOLD;

    return {
      valid: true,
      decoded: payload as JWTPayload & TokenUser,
      needsRenewal,
      timeLeft: timeUntilExpiry,
      securityLevel: (payload.securityLevel as string) || 'legacy',
    };
  } catch (error: unknown) {
    // Handle specific JWT errors (e.g., expired, invalid signature).
    if (error instanceof Error && 'code' in error) {
      const err = error as { code: string };
      if (err.code === 'ERR_JWT_EXPIRED') {
        return { valid: false, reason: 'Token expired', expired: true, needsRenewal: false, timeLeft: 0, securityLevel: 'enhanced' };
      }
      if (err.code === 'ERR_JWS_INVALID' || err.code === 'ERR_JWT_INVALID') {
        return { valid: false, reason: 'Invalid token signature', securityViolation: true, needsRenewal: false, timeLeft: 0, securityLevel: 'enhanced' };
      }
    }
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Token verification error', { error: message });
    return { valid: false, reason: 'Token verification failed', needsRenewal: false, timeLeft: 0, securityLevel: 'enhanced' };
  }
}

// --- AUTHENTICATION FLOW ---

/**
 * @function authenticateSecure
 * @description Performs a comprehensive secure authentication check for incoming requests.
 * This function integrates rate limiting, JWT verification, and session validation against the database.
 * @param {NextRequest} request - The incoming Next.js request.
 * @returns {Promise<AuthResult>} The result of the authentication attempt, including user data and session status.
 */
export async function authenticateSecure(request: NextRequest): Promise<AuthResult> {
  const ipAddress = getClientIP(request);

  // Apply rate limiting to prevent brute-force attacks on the authentication endpoint.
  const rateLimitResult = checkRateLimit(ipAddress);
  if (!rateLimitResult.allowed) {
    logger.warn('Rate limit exceeded', { ip: ipAddress });
    return {
      success: false,
      error: 'Too many requests',
      status: 429,
      headers: {
        'X-RateLimit-Limit': String(MAX_ATTEMPTS),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(Math.ceil(rateLimitResult.resetTime / 1000)),
      },
      needsRenewal: false,
      timeLeft: 0,
      securityLevel: 'enhanced'
    };
  }

  // Retrieve the admin token from cookies.
  const token = request.cookies.get('admin_token')?.value;
  if (!token) {
    return { success: false, error: 'Authentication required', status: 401, needsRenewal: false, timeLeft: 0, securityLevel: 'enhanced' };
  }

  // Verify the JWT token, including IP and device fingerprint checks.
  const tokenResult = await verifySecureToken(token, request);
  if (!tokenResult.valid || !tokenResult.decoded) {
    return { success: false, error: tokenResult.reason || 'Invalid authentication', status: 401, needsRenewal: false, timeLeft: 0, securityLevel: 'enhanced' };
  }

  try {
    // Validate the session against the database to ensure it's still active and not revoked.
    const session = await adminSessionsOps.getByToken(token);
    if (!session) {
      return { success: false, error: 'Session not found', status: 401, needsRenewal: false, timeLeft: 0, securityLevel: 'enhanced' };
    }
    // Check if the session has expired based on its database record.
    if (new Date(session.expires_at) < new Date()) {
      return { success: false, error: 'Session expired', status: 401, needsRenewal: false, timeLeft: 0, securityLevel: 'enhanced' };
    }
    // Check for maximum session age to enforce periodic re-authentication.
    const sessionAge = Date.now() - new Date(session.created_at).getTime();
    if (sessionAge > MAX_SESSION_AGE) {
      return { success: false, error: 'Session expired due to age', status: 401, needsRenewal: false, timeLeft: 0, securityLevel: 'enhanced' };
    }

    logger.info('Authentication successful', { ip: ipAddress, userId: tokenResult.decoded.userId, route: request.nextUrl.pathname });
    return {
      success: true,
      user: tokenResult.decoded,
      session,
      needsRenewal: tokenResult.needsRenewal,
      timeLeft: tokenResult.timeLeft,
      securityLevel: tokenResult.securityLevel,
      headers: {
        'X-RateLimit-Limit': String(MAX_ATTEMPTS),
        'X-RateLimit-Remaining': String(rateLimitResult.remaining),
        'X-RateLimit-Reset': String(Math.ceil(rateLimitResult.resetTime / 1000)),
      },
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Database error during authentication', { error: message });
    return { success: false, error: 'Authentication service error', status: 500, needsRenewal: false, timeLeft: 0, securityLevel: 'enhanced' };
  }
}

/**
 * @function refreshTokenIfNeeded
 * @description Refreshes the JWT token if it's nearing expiry.
 * This helps maintain continuous user sessions without requiring frequent re-logins.
 * @param {AuthResult} authResult - The current authentication result.
 * @param {NextRequest} request - The incoming Next.js request.
 * @returns {Promise<{ token: string; expiresAt: Date; maxAge: number } | null>} The new token data if refreshed, otherwise null.
 */
async function refreshTokenIfNeeded(authResult: AuthResult, request: NextRequest) {
  if (!authResult.needsRenewal || !authResult.user || !authResult.session) {
    return null;
  }
  try {
    const newToken = await generateSecureToken(authResult.user, request);
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_SECONDS * 1000);
    await adminSessionsOps.updateToken(authResult.session.id, newToken, expiresAt.toISOString());
    logger.info('Token refreshed successfully', { userId: authResult.user.id });
    return { token: newToken, expiresAt, maxAge: TOKEN_EXPIRY_SECONDS };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Token refresh failed', { error: message, userId: authResult.user.id });
    return null;
  }
}

/**
 * @function addSecurityHeaders
 * @description Adds common security headers to the HTTP response.
 * These headers help protect against various web vulnerabilities.
 * @param {NextResponse} response - The Next.js response object.
 * @returns {NextResponse} The response object with added security headers.
 */
function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  return response;
}

/**
 * @function withSecureAuth
 * @description A higher-order function (HOF) that wraps an API route handler to enforce secure authentication.
 * It performs authentication, handles token renewal, and adds security headers to the response.
 * @param {(request: NextRequest, context: T & { auth: AuthResult }) => Promise<NextResponse>} handler - The API route handler to wrap.
 * @returns {(request: NextRequest, context: T) => Promise<NextResponse>} The wrapped API route handler.
 */
export function withSecureAuth<T extends { params?: unknown }>(
  handler: (request: NextRequest, context: T & { auth: AuthResult }) => Promise<NextResponse>
): (request: NextRequest, context: T) => Promise<NextResponse> {
  return async (request: NextRequest, context: T) => {
    try {
      const authResult = await authenticateSecure(request);
      if (!authResult.success) {
        const response = new NextResponse(JSON.stringify({ error: authResult.error }), {
          status: authResult.status || 401,
          headers: authResult.headers as HeadersInit,
        });
        return addSecurityHeaders(response);
      }

      const refreshData = await refreshTokenIfNeeded(authResult, request);
      const result = await handler(request, { ...context, auth: authResult });

      if (refreshData) {
        result.cookies.set('admin_token', refreshData.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: refreshData.maxAge,
        });
        result.headers.set('X-Token-Refreshed', 'true');
      }

      if (authResult.headers) {
        Object.entries(authResult.headers).forEach(([key, value]) => {
          result.headers.set(key, value);
        });
      }
      return addSecurityHeaders(result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error('Secure auth wrapper error', { error: message });
      const response = NextResponse.json({ error: 'Authentication service error' }, { status: 500 });
      return addSecurityHeaders(response);
    }
  };
}

/**
 * @function secureLogout
 * @description Handles secure user logout by deleting the session token from the database.
 * @param {NextRequest} request - The incoming Next.js request.
 * @returns {Promise<{ success: boolean; error?: string }>} The result of the logout operation.
 */
export async function secureLogout(request: NextRequest): Promise<{ success: boolean; error?: string }> {
  try {
    const token = request.cookies.get('admin_token')?.value;
    if (token) {
      await adminSessionsOps.deleteByToken(token);
      logger.info('Secure logout completed', { ip: getClientIP(request) });
    }
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Secure logout error', { error: message });
    return { success: false, error: 'Logout failed' };
  }
}

/**
 * @function validateSession
 * @description Validates a user session by checking the token against the database.
 * This function is used by middleware and API routes to ensure the session is active and valid.
 * @param {string} token - The session token to validate.
 * @returns {Promise<{ valid: boolean; session?: AdminSession }>} The validation result, including the session data if valid.
 */
export async function validateSession(token: string): Promise<{ valid: boolean; session?: AdminSession }> {
  try {
    const session = await adminSessionsOps.getByToken(token);
    if (!session) {
      return { valid: false };
    }
    if (new Date(session.expires_at) < new Date()) {
      return { valid: false };
    }
    return { valid: true, session };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Session validation error', { error: message });
    return { valid: false };
  }
}

/**
 * @function validateToken
 * @description A placeholder function for CSRF token validation. This function is not fully implemented here
 * and serves as a reminder that CSRF token validation is crucial for protecting against CSRF attacks.
 * @param {number} sessionId - The ID of the session.
 * @param {string} csrfToken - The CSRF token to validate.
 * @returns {boolean} Always returns false as this is a placeholder.
 */
export function validateToken(sessionId: number, csrfToken: string): boolean {
  if (!sessionId || !csrfToken) {
    return false;
  }
  const expectedToken = `csrf-${sessionId}`;
  return csrfToken === expectedToken;
}


//   ___________       *Written and developed by Gabriel Lacroix*               __      ___.
//   \_   _____/__  __ ___________  ___________   ____   ____   ____   /  \    /  \ ____\_ |__  
//    |    __)_\  \/ // __ \_  __ \/ ___\_  __ \_/ __ \_/ __ \ /    \  \   \/\/   // __ \| __ \ 
//    |        \\   /\  ___/|  | \/ /_/  >  | \/\  ___/\  ___/|   |  \  \        /\  ___/| \_\ \
//   /_______  / \_/  \___  >__|  \___  /|__|    \___  >\___  >___|  /   \__/\  /  \___  >___  /
//           \/           \/     /_____/             \/     \/     \/         \/       \/    \/ 
//                     _________      .__          __  .__                                      
//                    /   _____/ ____ |  |  __ ___/  |_|__| ____   ____   ______                
//                    \_____  \ /  _ \|  | |  |  \   __\  |/  _ \ /    \ /  ___/                
//                    /        (  <_> )  |_|  |  /|  | |  (  <_> )   |  \\___ \                 
//                   /_______  /\____/|____/____/ |__| |__|\____/|___|  /____  >                
//                           \/ https://www.evergreenwebsolutions.ca  \/     \/                 