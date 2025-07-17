// src/app/api/adm_f7f8556683f1cdc65391d8d2_8e91/login/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import sanitizeHtml from 'isomorphic-dompurify';
import { adminUsersOps, adminSessionsOps } from '../../../../../lib/database';
import { logger, handleApiError } from '../../../../../lib/logger';
import { generateSecureToken } from '../../../../../lib/secure-jwt';
import { applyProgressiveRateLimit } from '../../../../../lib/rate-limiter';
import { 
  checkAccountLockout, 
  recordFailedLoginAttempt, 
  resetFailedLoginAttempts,
  checkIPLockout
} from '../../../../../lib/account-security';

// Define validation schema for login inputs
const loginSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username cannot exceed 50 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password cannot exceed 100 characters')
});

// Function to sanitize input
function sanitizeInput(input: unknown): unknown {
  if (typeof input === 'string') {
    return sanitizeHtml.sanitize(input, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: []
    });
  } else if (typeof input === 'object' && input !== null) {
    const sanitized: { [key: string]: unknown } = {};
    for (const key in input) {
      if (Object.prototype.hasOwnProperty.call(input, key)) {
        sanitized[key] = sanitizeInput((input as Record<string, unknown>)[key]);
      }
    }
    return sanitized;
  }
  return input;
}

// Helper function to ensure we have a valid Date object for headers
function getValidResetDate(resetTime: Date | number): Date {
  if (resetTime instanceof Date && !isNaN(resetTime.getTime())) {
    return resetTime;
  }
  // Fallback: current time + 60 seconds
  return new Date(Date.now() + 60000);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    logger.info('Login attempt', { 
      ip, 
      userAgent: userAgent.substring(0, 50),
      route: request.nextUrl.pathname,
      method: request.method
    });

    const ipLockoutStatus = await checkIPLockout(ip);
    if (ipLockoutStatus.locked) {
      logger.warn('IP address locked out', { 
        ip, 
        failedAttempts: ipLockoutStatus.failedAttempts
      });
      const response = NextResponse.json(
        { 
          error: 'Too many failed login attempts from this IP address. Please try again later.',
          lockoutUntil: ipLockoutStatus.lockoutUntil
        },
        { status: 429 }
      );
      response.headers.set('Retry-After', Math.ceil((ipLockoutStatus.remainingTime || 0) / 1000).toString());
      return response;
    }

    const rawBody = await request.json();
    const body = sanitizeInput(rawBody) as Record<string, unknown>;

    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      const formattedErrors = validationResult.error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message
      }));
      logger.warn('Login validation failed', { 
        ip, 
        errors: formattedErrors,
        username: typeof body.username === 'string' ? body.username : 'unknown'
      });
      return NextResponse.json(
        { 
          error: 'Invalid input', 
          details: formattedErrors 
        },
        { status: 400 }
      );
    }

    const { username, password } = validationResult.data;

    const lockoutStatus = await checkAccountLockout(username);
    if (lockoutStatus.locked) {
      logger.warn('Login attempt on locked account', { 
        ip, 
        username,
        lockoutRemaining: Math.ceil((lockoutStatus.remainingTime || 0) / 1000)
      });
      return NextResponse.json(
        { 
          error: 'Account temporarily locked due to multiple failed attempts', 
          lockoutUntil: lockoutStatus.lockoutUntil,
          retryAfter: Math.ceil((lockoutStatus.remainingTime || 0) / 1000)
        },
        { status: 429 }
      );
    }

    const rateLimitResult = await applyProgressiveRateLimit(
      request, 
      ip, 
      lockoutStatus.failedAttempts || 0, 
      'login'
    );

    if (rateLimitResult.limited) {
      logger.warn('Rate limit exceeded for login', { 
        ip, 
        username,
        failedAttempts: lockoutStatus.failedAttempts || 0
      });
      const response = NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      );
      const resetTime = getValidResetDate(rateLimitResult.resetTime);
      response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString());
      response.headers.set('X-RateLimit-Remaining', '0');
      response.headers.set('X-RateLimit-Reset', resetTime.toISOString());
      response.headers.set('Retry-After', Math.ceil((resetTime.getTime() - new Date().getTime()) / 1000).toString());
      return response;
    }

    const user = await adminUsersOps.getByUsername(username);
    if (!user) {
      await recordFailedLoginAttempt(username, ip);
      logger.warn('Login failed: User not found', { ip, username });
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      await recordFailedLoginAttempt(username, ip);
      logger.warn('Login failed: Invalid password', { ip, username, userId: user.id });
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    await resetFailedLoginAttempts(username);
    logger.info('Login successful', { ip, username, userId: user.id });

    try {
      await adminSessionsOps.deleteByUserId(user.id);
      logger.info('Cleared existing sessions for user', { userId: user.id });
    } catch (clearError: unknown) {
      const message = clearError instanceof Error ? clearError.message : String(clearError);
      logger.warn('Failed to clear existing sessions', { 
        userId: user.id, 
        error: message 
      });
    }

    const token = await generateSecureToken({
      id: user.id,
      userId: user.id,
      username: user.username,
      email: user.email
    }, request);

    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);

    try {
      await adminSessionsOps.create(
        user.id,
        token,
        expiresAt.toISOString(),
        ip,
        userAgent.substring(0, 255)
      );
      logger.info('Session created successfully', { 
        userId: user.id, 
        tokenLength: token.length 
      });
    } catch (sessionError: unknown) {
      const message = sessionError instanceof Error ? sessionError.message : String(sessionError);
      logger.error('Failed to create session', { 
        userId: user.id, 
        error: message,
        tokenLength: token.length
      });
      return NextResponse.json(
        { error: 'Failed to create session. Please try again.' },
        { status: 500 }
      );
    }

    await adminUsersOps.updateLastLogin(user.id);

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });

    const resetTime = getValidResetDate(rateLimitResult.resetTime);
    response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString());
    response.headers.set('X-RateLimit-Remaining', (rateLimitResult.remaining || 0).toString());
    response.headers.set('X-RateLimit-Reset', resetTime.toISOString());

    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 2 * 60 * 60,
      path: '/'
    });

    return response;

  } catch (error: unknown) {
    const errorResponse = await handleApiError(error, request);
    return NextResponse.json(
      { error: errorResponse.error },
      { status: errorResponse.status }
    );
  }
}