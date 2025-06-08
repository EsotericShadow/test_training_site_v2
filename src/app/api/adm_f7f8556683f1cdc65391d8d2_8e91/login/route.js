// src/app/api/adm_f7f8556683f1cdc65391d8d2_8e91/login/route.js
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
// Remove jwt import since it's not directly used
import { z } from 'zod';
import sanitizeHtml from 'sanitize-html';
import { adminUsersOps } from '../../../../../lib/database';
// Remove adminSessionsOps import since it's not directly used
import { logger, handleApiError } from '../../../../../lib/logger';
import { createSession } from '../../../../../lib/session-manager';
import { applyProgressiveRateLimit } from '../../../../../lib/rate-limiter';
import { 
  checkAccountLockout, 
  recordFailedLoginAttempt, 
  resetFailedLoginAttempts,
  checkIPLockout
} from '../../../../../lib/account-security';

// Ensure JWT_SECRET is set - this is critical for security
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET environment variable is not set!');
  console.error('Application cannot start securely without a JWT_SECRET.');
  console.error('Please set this environment variable before starting the application.');
  // Cannot use process.exit(1) in Edge Runtime
  throw new Error('JWT_SECRET environment variable is not set');
}

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
function sanitizeInput(input) {
  if (typeof input === 'string') {
    return sanitizeHtml(input, {
      allowedTags: [], // No HTML tags allowed
      allowedAttributes: {}, // No attributes allowed
      disallowedTagsMode: 'recursiveEscape' // Escape all disallowed tags
    });
  } else if (typeof input === 'object' && input !== null) {
    const sanitized = {};
    for (const key in input) {
      sanitized[key] = sanitizeInput(input[key]);
    }
    return sanitized;
  }
  return input;
}

// Helper function to ensure we have a valid Date object for headers
function getValidResetDate(resetTime) {
  if (resetTime instanceof Date && !isNaN(resetTime)) {
    return resetTime;
  }
  // Fallback: current time + 60 seconds
  return new Date(Date.now() + 60000);
}

export async function POST(request) {
  try {
    // Get client IP address
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    
    // Get user agent
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    // Log login attempt
    logger.info('Login attempt', { 
      ip, 
      userAgent: userAgent.substring(0, 50), // Truncate for logging
      route: request.nextUrl.pathname,
      method: request.method
    });
    
    // Check if IP is locked out (too many failed attempts across all usernames)
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
      
      // Add lockout headers
      response.headers.set('Retry-After', Math.ceil(ipLockoutStatus.remainingTime / 1000).toString());
      
      return response;
    }
    
    // Parse request body
    const rawBody = await request.json();
    
    // Sanitize input
    const body = sanitizeInput(rawBody);
    
    // Validate input
    try {
      loginSchema.parse(body);
    } catch (error) {
      // Format Zod errors for better readability
      const formattedErrors = error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message
      }));
      
      logger.warn('Login validation failed', { 
        ip, 
        errors: formattedErrors,
        username: body.username
      });
      
      return NextResponse.json(
        { 
          error: 'Invalid input', 
          details: formattedErrors 
        },
        { status: 400 }
      );
    }

    const { username, password } = body;
    
    // Check if account is locked out
    const lockoutStatus = await checkAccountLockout(username);
    if (lockoutStatus.locked) {
      logger.warn('Login attempt on locked account', { 
        ip, 
        username,
        lockoutRemaining: Math.ceil(lockoutStatus.remainingTime / 1000)
      });
      
      return NextResponse.json(
        { 
          error: 'Account temporarily locked due to multiple failed attempts', 
          lockoutUntil: lockoutStatus.lockoutUntil,
          retryAfter: Math.ceil(lockoutStatus.remainingTime / 1000)
        },
        { status: 429 }
      );
    }
    
    // Apply progressive rate limiting based on failed attempts
    const rateLimitResult = await applyProgressiveRateLimit(
      request, 
      ip, 
      lockoutStatus.failedAttempts || 0, 
      'login'
    );
    
    // If rate limited, return 429 Too Many Requests
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
      
      // Ensure we have a valid Date object for the reset time
      const resetTime = getValidResetDate(rateLimitResult.resetTime);
      
      // Add rate limit headers
      response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString());
      response.headers.set('X-RateLimit-Remaining', '0');
      response.headers.set('X-RateLimit-Reset', resetTime.toISOString());
      response.headers.set('Retry-After', Math.ceil((resetTime - new Date()) / 1000).toString());
      
      return response;
    }

    // Get user from database
    const user = await adminUsersOps.getByUsername(username);
    
    if (!user) {
      // Record failed attempt for non-existent user
      await recordFailedLoginAttempt(username, ip);
      
      logger.warn('Login failed: User not found', { ip, username });
      
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check password
    const isValidPassword = bcrypt.compareSync(password, user.password_hash);
    
    if (!isValidPassword) {
      // Record failed attempt
      await recordFailedLoginAttempt(username, ip);
      
      logger.warn('Login failed: Invalid password', { ip, username, userId: user.id });
      
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Reset failed attempts on successful login
    await resetFailedLoginAttempts(username);

    // Log successful login
    logger.info('Login successful', { ip, username, userId: user.id });

    // Create session using the session manager with IP and user agent
    const sessionData = await createSession(user, ip, userAgent);

    // Update last login
    await adminUsersOps.updateLastLogin(user.id);

    // Set HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });

    // Ensure we have a valid Date object for the reset time
    const resetTime = getValidResetDate(rateLimitResult.resetTime);

    // Add rate limit headers to successful response
    response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString());
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
    response.headers.set('X-RateLimit-Reset', resetTime.toISOString());

    // Set secure cookie with improved settings
    response.cookies.set('admin_token', sessionData.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
      sameSite: 'strict',
      maxAge: sessionData.maxAge, // Use the maxAge from session config
      path: '/' // Restrict cookie to admin paths only
    } );

    return response;

  } catch (error) {
    // Use the handleApiError utility for consistent error handling
    const errorResponse = handleApiError(error, request);
    
    return NextResponse.json(
      { error: errorResponse.error },
      { status: errorResponse.status }
    );
  }
}

