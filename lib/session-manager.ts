/*
 * Evergreen Web Solutions
 * Written and developed by Gabriel Lacroix
 *
 * File: session-manager.ts
 * Description: To be filled in with the script's purpose
 * Dependencies: To be filled in with key dependencies or modules
 * Created: August 2, 2025
 * Last Modified: August 2, 2025
 * Version: 1.0.0
 */
// lib/session-manager.ts
import { NextRequest } from 'next/server';
import { generateSecureToken, verifySecureToken, TOKEN_EXPIRY_SECONDS } from './secure-jwt';
import { adminSessionsOps } from './database';
import { logger } from './logger';
import type { AdminUser, AdminSession } from '../types/database';

// --- TYPE DEFINITIONS ---

interface SessionConfig {
  maxAge: number;
  inactivityTimeout: number;
  cookieName: string;
  renewThreshold: number;
  securityLevel: string;
  features: string[];
}

export interface SessionValidationResult {
  valid: boolean;
  reason?: string;
  session?: AdminSession;
  needsRenewal?: boolean;
  timeLeft?: number;
  securityLevel?: string;
}

interface SessionData {
  token: string;
  expiresAt: Date;
  maxAge: number;
}

// --- CONFIGURATION ---

const SESSION_CONFIG: Omit<SessionConfig, 'securityLevel' | 'features'> = {
  maxAge: 24 * 60 * 60, // 24 hours in seconds
  inactivityTimeout: 30 * 60, // 30 minutes in seconds
  cookieName: 'admin_token',
  renewThreshold: 15 * 60, // 15 minutes in seconds
};

// --- FUNCTIONS ---

export async function createSession(user: Pick<AdminUser, 'id' | 'username' | 'email'>, ipAddress: string = 'unknown', userAgent: string = 'unknown'): Promise<SessionData> {
  try {
    const mockRequest = {
      headers: new Headers({
        'x-forwarded-for': ipAddress,
        'x-real-ip': ipAddress,
        'user-agent': userAgent,
        'accept-language': 'en-US,en;q=0.9',
        'accept-encoding': 'gzip, deflate, br',
      }),
    } as NextRequest;

    const token = await generateSecureToken({
      id: user.id,
      userId: user.id,
      username: user.username,
      email: user.email
    }, mockRequest);

    const expiresAt = new Date(Date.now() + (TOKEN_EXPIRY_SECONDS * 1000));

    await adminSessionsOps.create(
      user.id,
      token,
      expiresAt.toISOString(),
      ipAddress,
      userAgent.substring(0, 255)
    );

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
      maxAge: TOKEN_EXPIRY_SECONDS,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Failed to create enhanced session', { 
      userId: user.id, 
      error: message,
      ipAddress,
      userAgent: userAgent?.substring(0, 50)
    });
    throw error;
  }
}

export async function validateSession(token: string, request: NextRequest): Promise<SessionValidationResult> {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const tokenResult = await verifySecureToken(token, request);

    if (!tokenResult.valid || !tokenResult.decoded) {
      logger.warn('Enhanced session validation failed', { 
        ip, 
        reason: tokenResult.reason || 'invalid_token',
        securityLevel: 'enhanced'
      });
      return { valid: false, reason: tokenResult.reason || 'invalid_token' };
    }

    const decoded = tokenResult.decoded;
    const session = await adminSessionsOps.getByToken(token);

    if (!session) {
      logger.warn('Session not found in database', { ip, userId: decoded.userId });
      return { valid: false, reason: 'session_not_found' };
    }

    const now = new Date();
    const expiresAt = new Date(session.expires_at);
    if (now >= expiresAt) {
      logger.warn('Session expired', { ip, userId: session.user_id });
      return { valid: false, reason: 'session_expired' };
    }

    const timeLeft = (expiresAt.getTime() - now.getTime()) / 1000;
    const needsRenewal = tokenResult.needsRenewal || timeLeft < SESSION_CONFIG.renewThreshold;

    await adminSessionsOps.updateLastActivity(token);

    return {
      valid: true,
      session,
      needsRenewal,
      timeLeft,
      securityLevel: 'enhanced'
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Error validating enhanced session', { error: message });
    return { valid: false, reason: 'validation_error' };
  }
}

export async function renewSession(session: AdminSession, request: NextRequest): Promise<SessionData> {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const newToken = await generateSecureToken({
      id: session.user_id,
      userId: session.user_id,
      username: session.username || '',
      email: session.email || ''
    }, request);

    const newExpiresAt = new Date(Date.now() + (TOKEN_EXPIRY_SECONDS * 1000));

    await adminSessionsOps.updateToken(session.id, newToken, newExpiresAt.toISOString());

    logger.info('Enhanced session renewed', { 
      ip, 
      userId: session.user_id,
      securityLevel: 'enhanced'
    });

    return {
      token: newToken,
      expiresAt: newExpiresAt,
      maxAge: TOKEN_EXPIRY_SECONDS,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Failed to renew enhanced session', { 
      userId: session.user_id, 
      error: message 
    });
    throw error;
  }
}

export async function getUserSessions(userId: number): Promise<AdminSession[]> {
  try {
    return await adminSessionsOps.getByUserId(userId);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Failed to get user sessions', { 
      userId, 
      error: message 
    });
    throw error;
  }
}

export async function terminateSession(sessionId: string, userId: number): Promise<boolean> {
  try {
    const session = await adminSessionsOps.getById(Number(sessionId));
    
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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Failed to terminate session', { 
      userId, 
      sessionId,
      error: message 
    });
    throw error;
  }
}

export async function terminateOtherSessions(userId: number, currentToken: string): Promise<number> {
  try {
    const count = await adminSessionsOps.deleteAllExcept(userId, currentToken);
    logger.info('Terminated other enhanced sessions', { 
      userId, 
      count,
      securityLevel: 'enhanced'
    });
    return count;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Failed to terminate other sessions', { 
      userId, 
      error: message 
    });
    throw error;
  }
}

export function getSessionConfig(): SessionConfig {
  return { 
    ...SESSION_CONFIG,
    securityLevel: 'enhanced',
    features: ['ip_binding', 'device_fingerprinting', 'rate_limiting']
  };
}

console.log('Enhanced session manager loaded with secure JWT integration');


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