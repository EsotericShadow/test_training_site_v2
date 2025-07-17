// lib/secure-jwt.ts
import { NextRequest, NextResponse } from 'next/server';
import { adminSessionsOps } from './database';
import { logger } from './logger';
import { SignJWT, jwtVerify, JWTPayload } from 'jose';
import type { AdminSession } from '../types/database';

// --- TYPE DEFINITIONS ---

interface RateLimitData {
  count: number;
  timestamp: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

interface TokenUser {
  id: number;
  userId: number;
  username: string;
  email: string;
}

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

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}
const secret = new TextEncoder().encode(JWT_SECRET);

export const TOKEN_EXPIRY_SECONDS = 2 * 60 * 60; // 2 hours
const REFRESH_THRESHOLD = 30 * 60 * 1000; // 30 minutes
const MAX_SESSION_AGE = 24 * 60 * 60 * 1000; // 24 hours
const RATE_LIMIT_WINDOW = 5 * 60 * 1000; // 5 minutes
const MAX_ATTEMPTS = 50; // 50 requests per 5 minutes

const rateLimitStore = new Map<string, RateLimitData>();

// --- HELPER FUNCTIONS ---

export function generateFingerprint(request: NextRequest): string {
  const userAgent = request.headers.get('user-agent') || '';
  const acceptLanguage = request.headers.get('accept-language') || '';
  const acceptEncoding = request.headers.get('accept-encoding') || '';
  const fingerprint = btoa(userAgent + acceptLanguage + acceptEncoding).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
  return fingerprint.substring(0, 16);
}

export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  return typeof forwarded === 'string' && forwarded.length > 0
    ? (forwarded?.split(',')[0]?.trim() ?? realIP ?? 'unknown')
    : realIP || 'unknown';
}

async function simpleHash(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
}

function generateUniqueId(): string {
  const timestamp = Date.now().toString(36);
  const random1 = Math.random().toString(36).substring(2);
  const random2 = Math.random().toString(36).substring(2);
  return timestamp + random1 + random2;
}

export function checkRateLimit(identifier: string): RateLimitResult {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;

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

export async function generateSecureToken(user: TokenUser, request: NextRequest): Promise<string> {
  const now = Date.now();
  const ipAddress = getClientIP(request);
  const deviceFingerprint = generateFingerprint(request);

  const payload = {
    ...user,
    iat: Math.floor(now / 1000),
    iss: 'karma-training-cms',
    aud: 'admin-panel',
    jti: generateUniqueId(),
    ipHash: await simpleHash(ipAddress),
    deviceFingerprint,
    securityLevel: 'enhanced',
    sessionStart: now,
    randomSalt: Math.random().toString(36).substring(2, 15),
  };

  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${TOKEN_EXPIRY_SECONDS}s`)
    .sign(secret);
}

export async function verifySecureToken(token: string, request: NextRequest): Promise<VerificationResult> {
  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ['HS256'],
      issuer: 'karma-training-cms',
      audience: 'admin-panel',
    });

    const currentIP = getClientIP(request);
    const currentFingerprint = generateFingerprint(request);

    if (payload.ipHash && payload.ipHash !== await simpleHash(currentIP)) {
      logger.warn('Token IP mismatch detected', { userId: payload.userId as string });
      return { valid: false, reason: 'IP address mismatch', securityViolation: true, needsRenewal: false, timeLeft: 0, securityLevel: 'enhanced' };
    }

    if (payload.deviceFingerprint && payload.deviceFingerprint !== currentFingerprint) {
      logger.warn('Token device fingerprint mismatch', { userId: payload.userId as string });
      return { valid: false, reason: 'Device fingerprint mismatch', securityViolation: true, needsRenewal: false, timeLeft: 0, securityLevel: 'enhanced' };
    }

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

export async function authenticateSecure(request: NextRequest): Promise<AuthResult> {
  const ipAddress = getClientIP(request);

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

  const token = request.cookies.get('admin_token')?.value;
  if (!token) {
    return { success: false, error: 'Authentication required', status: 401, needsRenewal: false, timeLeft: 0, securityLevel: 'enhanced' };
  }

  const tokenResult = await verifySecureToken(token, request);
  if (!tokenResult.valid || !tokenResult.decoded) {
    return { success: false, error: tokenResult.reason || 'Invalid authentication', status: 401, needsRenewal: false, timeLeft: 0, securityLevel: 'enhanced' };
  }

  try {
    const session = await adminSessionsOps.getByToken(token);
    if (!session) {
      return { success: false, error: 'Session not found', status: 401, needsRenewal: false, timeLeft: 0, securityLevel: 'enhanced' };
    }
    if (new Date(session.expires_at) < new Date()) {
      return { success: false, error: 'Session expired', status: 401, needsRenewal: false, timeLeft: 0, securityLevel: 'enhanced' };
    }
    const sessionAge = Date.now() - new Date(session.created_at).getTime();
    if (sessionAge > MAX_SESSION_AGE) {
      return { success: false, error: 'Session expired due to age', status: 401, needsRenewal: false, timeLeft: 0, securityLevel: 'enhanced' };
    }

    logger.info('Authentication successful', { userId: tokenResult.decoded.userId });
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
export function validateToken(sessionId: number, csrfToken: string): boolean {
  if (!sessionId || !csrfToken) {
    return false;
  }
  const expectedToken = `csrf-${sessionId}`;
  return csrfToken === expectedToken;
}     
