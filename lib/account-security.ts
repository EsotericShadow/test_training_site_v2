// lib/account-security.ts
import { sql } from '@vercel/postgres';
import { logger } from './logger';

// --- TYPE DEFINITIONS ---

export interface LockoutStatus {
  locked: boolean;
  remainingTime?: number;
  lockoutUntil?: Date;
  failedAttempts?: number;
}

export interface FailedLoginAttempt {
  username: string;
  ip_address: string;
  attempt_time: string;
}

export interface FailedLoginStats {
  totalAttempts: number;
  uniqueUsernames: number;
  uniqueIPs: number;
  timeWindow: number;
}


// --- CONFIGURATION ---

const LOCKOUT_THRESHOLD = 5; // Number of failed attempts before lockout
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds
const ATTEMPT_WINDOW = 60 * 60 * 1000; // Consider attempts in the last hour


// --- FUNCTIONS ---

export async function checkAccountLockout(username: string): Promise<LockoutStatus> {
  try {
    const windowStart = new Date(Date.now() - ATTEMPT_WINDOW);
    
    const result = await sql`
      SELECT COUNT(*) as attempt_count, MAX(attempt_time) as last_attempt
      FROM failed_login_attempts
      WHERE username = ${username}
      AND attempt_time > ${windowStart.toISOString()}
    `;
    
    const failedAttempts = parseInt(result.rows[0]?.attempt_count || '0', 10);
    const lastAttemptTime = result.rows[0]?.last_attempt;
    
    if (failedAttempts >= LOCKOUT_THRESHOLD && lastAttemptTime) {
      const lastAttempt = new Date(lastAttemptTime);
      const lockoutUntil = new Date(lastAttempt.getTime() + LOCKOUT_DURATION);
      
      if (new Date() < lockoutUntil) {
        const remainingTime = lockoutUntil.getTime() - Date.now();
        logger.warn('Account locked out', { 
          username, 
          failedAttempts,
          lockoutUntil: lockoutUntil.toISOString(),
          remainingSeconds: Math.ceil(remainingTime / 1000)
        });
        
        return {
          locked: true,
          remainingTime,
          lockoutUntil,
          failedAttempts
        };
      }
    }
    
    return { 
      locked: false, 
      failedAttempts 
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Error checking account lockout', { 
      error: message,
      username
    });
    return { locked: false };
  }
}

export async function recordFailedLoginAttempt(username: string, ipAddress: string): Promise<void> {
  try {
    await sql`
      INSERT INTO failed_login_attempts (username, ip_address)
      VALUES (${username}, ${ipAddress})
    `;
    logger.info('Recorded failed login attempt', { username, ipAddress });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Error recording failed login attempt', { 
      error: message,
      username,
      ipAddress
    });
  }
}

export async function resetFailedLoginAttempts(username: string): Promise<void> {
  try {
    const result = await sql`
      DELETE FROM failed_login_attempts
      WHERE username = ${username}
    `;
    logger.info('Reset failed login attempts', { 
      username, 
      count: result.rowCount || 0
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Error resetting failed login attempts', { 
      error: message,
      username
    });
  }
}

export async function cleanupFailedLoginAttempts(): Promise<void> {
  try {
    const cutoff = new Date(Date.now() - (24 * 60 * 60 * 1000)); // 24 hours ago
    const result = await sql`
      DELETE FROM failed_login_attempts
      WHERE attempt_time < ${cutoff.toISOString()}
    `;
    logger.info('Cleaned up old failed login attempts', { 
      count: result.rowCount || 0
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Error cleaning up failed login attempts', { 
      error: message
    });
  }
}

export async function getFailedLoginStats(hours: number = 24): Promise<FailedLoginStats> {
  try {
    const cutoff = new Date(Date.now() - (hours * 60 * 60 * 1000));
    const result = await sql`
      SELECT 
        COUNT(*) as total_attempts,
        COUNT(DISTINCT username) as unique_usernames,
        COUNT(DISTINCT ip_address) as unique_ips
      FROM failed_login_attempts
      WHERE attempt_time > ${cutoff.toISOString()}
    `;
    
    return {
      totalAttempts: parseInt(result.rows[0]?.total_attempts || '0', 10),
      uniqueUsernames: parseInt(result.rows[0]?.unique_usernames || '0', 10),
      uniqueIPs: parseInt(result.rows[0]?.unique_ips || '0', 10),
      timeWindow: hours
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Error getting failed login stats', { 
      error: message
    });
    return {
      totalAttempts: 0,
      uniqueUsernames: 0,
      uniqueIPs: 0,
      timeWindow: hours
    };
  }
}

export async function getRecentFailedAttempts(username: string, limit: number = 10): Promise<FailedLoginAttempt[]> {
  try {
    const { rows } = await sql`
      SELECT username, ip_address, attempt_time
      FROM failed_login_attempts
      WHERE username = ${username}
      ORDER BY attempt_time DESC
      LIMIT ${limit}
    `;
    return rows as FailedLoginAttempt[];
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Error getting recent failed attempts', { 
      error: message,
      username
    });
    return [];
  }
}

export async function checkIPLockout(ipAddress: string): Promise<LockoutStatus> {
  try {
    const windowStart = new Date(Date.now() - ATTEMPT_WINDOW);
    const result = await sql`
      SELECT COUNT(*) as attempt_count, MAX(attempt_time) as last_attempt
      FROM failed_login_attempts
      WHERE ip_address = ${ipAddress}
      AND attempt_time > ${windowStart.toISOString()}
    `;
    
    const failedAttempts = parseInt(result.rows[0]?.attempt_count || '0', 10);
    const lastAttemptTime = result.rows[0]?.last_attempt;
    
    const IP_LOCKOUT_THRESHOLD = 20;
    
    if (failedAttempts >= IP_LOCKOUT_THRESHOLD && lastAttemptTime) {
      const lastAttempt = new Date(lastAttemptTime);
      const lockoutUntil = new Date(lastAttempt.getTime() + LOCKOUT_DURATION);
      
      if (new Date() < lockoutUntil) {
        const remainingTime = lockoutUntil.getTime() - Date.now();
        logger.warn('IP address locked out', { 
          ipAddress, 
          failedAttempts,
          lockoutUntil: lockoutUntil.toISOString(),
          remainingSeconds: Math.ceil(remainingTime / 1000)
        });
        
        return {
          locked: true,
          remainingTime,
          lockoutUntil,
          failedAttempts
        };
      }
    }
    
    return { 
      locked: false, 
      failedAttempts 
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Error checking IP lockout', { 
      error: message,
      ipAddress
    });
    return { locked: false };
  }
}
