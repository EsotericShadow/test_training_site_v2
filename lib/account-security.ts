/*
 * Evergreen Web Solutions
 * Written and developed by Gabriel Lacroix
 *
 * File: account-security.ts
 * Description: This script provides robust account security features, including brute-force
 * protection and account lockout mechanisms. It is designed to be used in conjunction
 * with the main authentication logic to prevent unauthorized access to user accounts.
 *
 * Dependencies:
 * - @vercel/postgres: Used for all database interactions.
 * - ./logger: The application's centralized logging utility.
 *
 * Created: 2025-06-07
 * Last Modified: 2025-07-17
 * Version: 1.0.1
 */

import { sql } from '@vercel/postgres';
import { logger } from './logger';

// --- TYPE DEFINITIONS ---

/**
 * @interface LockoutStatus
 * @description Represents the lockout status of an account or IP address.
 * This interface is used to return a consistent object from the lockout check functions.
 *
 * @property {boolean} locked - Whether the account or IP is currently locked out.
 * @property {number} [remainingTime] - The remaining lockout time in milliseconds.
 * @property {Date} [lockoutUntil] - The date and time when the lockout expires.
 * @property {number} [failedAttempts] - The number of failed attempts recorded.
 */
export interface LockoutStatus {
  locked: boolean;
  remainingTime?: number;
  lockoutUntil?: Date;
  failedAttempts?: number;
}

/**
 * @interface FailedLoginAttempt
 * @description Represents a single failed login attempt.
 * This is used to type the data returned from the database when querying for recent failed attempts.
 */
export interface FailedLoginAttempt {
  username: string;
  ip_address: string;
  attempt_time: string;
}

/**
 * @interface FailedLoginStats
 * @description Represents statistics about failed login attempts.
 * This is used to provide an overview of the security status of the application.
 */
export interface FailedLoginStats {
  totalAttempts: number;
  uniqueUsernames: number;
  uniqueIPs: number;
  timeWindow: number;
}


// --- CONFIGURATION ---

// The number of failed login attempts before an account is locked out.
const LOCKOUT_THRESHOLD = 5;
// The duration of the lockout in milliseconds (15 minutes).
const LOCKOUT_DURATION = 15 * 60 * 1000;
// The time window in which failed attempts are counted, in milliseconds (1 hour).
const ATTEMPT_WINDOW = 60 * 60 * 1000;


// --- FUNCTIONS ---

/**
 * @function checkAccountLockout
 * @description Checks if an account is currently locked out due to too many failed login attempts.
 * This function is a critical part of the brute-force protection mechanism.
 * @param {string} username - The username to check.
 * @returns {Promise<LockoutStatus>} The lockout status of the account.
 */
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

/**
 * @function recordFailedLoginAttempt
 * @description Records a failed login attempt for a given username and IP address.
 * This is essential for tracking brute-force attempts and triggering lockouts.
 * @param {string} username - The username for which the failed attempt is being recorded.
 * @param {string} ipAddress - The IP address from which the attempt was made.
 */
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

/**
 * @function resetFailedLoginAttempts
 * @description Resets the failed login attempts for a given username.
 * This should be called after a successful login to clear the slate for the user.
 * @param {string} username - The username for which to reset the failed attempts.
 */
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

/**
 * @function cleanupFailedLoginAttempts
 * @description Cleans up old failed login attempts from the database.
 * This is a maintenance function that should be run periodically to keep the database clean.
 */
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

/**
 * @function getFailedLoginStats
 * @description Retrieves statistics about failed login attempts over a given time window.
 * This can be used to monitor the security of the application and identify potential attacks.
 * @param {number} [hours=24] - The time window in hours to retrieve stats for.
 * @returns {Promise<FailedLoginStats>} Statistics about failed login attempts.
 */
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

/**
 * @function getRecentFailedAttempts
 * @description Retrieves the most recent failed login attempts for a given username.
 * This can be useful for debugging and for providing users with information about their account security.
 * @param {string} username - The username to retrieve failed attempts for.
 * @param {number} [limit=10] - The maximum number of attempts to retrieve.
 * @returns {Promise<FailedLoginAttempt[]>} A list of recent failed login attempts.
 */
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

/**
 * @function checkIPLockout
 * @description Checks if an IP address is currently locked out due to an excessive number of failed login attempts.
 * This is a more aggressive security measure to block malicious IPs that are attempting to brute-force multiple accounts.
 * @param {string} ipAddress - The IP address to check.
 * @returns {Promise<LockoutStatus>} The lockout status of the IP address.
 */
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