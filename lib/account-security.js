// lib/account-security.js
import { sql } from '@vercel/postgres';
import { logger } from './logger';

// Configuration
const LOCKOUT_THRESHOLD = 5; // Number of failed attempts before lockout
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds
const ATTEMPT_WINDOW = 60 * 60 * 1000; // Consider attempts in the last hour

/**
 * Check if an account is currently locked out
 * @param {string} username - The username to check
 * @returns {Object} - Lockout status information
 */
export async function checkAccountLockout(username) {
  try {
    // Get recent failed attempts within the window
    const windowStart = new Date(Date.now() - ATTEMPT_WINDOW);
    
    const result = await sql`
      SELECT COUNT(*) as attempt_count, MAX(attempt_time) as last_attempt
      FROM failed_login_attempts
      WHERE username = ${username}
      AND attempt_time > ${windowStart.toISOString()}
    `;
    
    const failedAttempts = parseInt(result.rows[0]?.attempt_count || '0');
    const lastAttemptTime = result.rows[0]?.last_attempt;
    
    if (failedAttempts >= LOCKOUT_THRESHOLD && lastAttemptTime) {
      const lastAttempt = new Date(lastAttemptTime);
      const lockoutUntil = new Date(lastAttempt.getTime() + LOCKOUT_DURATION);
      
      if (new Date() < lockoutUntil) {
        // Account is locked
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
  } catch (error) {
    logger.error('Error checking account lockout', { 
      error: error.message,
      username
    });
    // Default to not locked in case of error
    return { locked: false };
  }
}

/**
 * Record a failed login attempt
 * @param {string} username - The username that failed to login
 * @param {string} ipAddress - The IP address of the request
 */
export async function recordFailedLoginAttempt(username, ipAddress) {
  try {
    await sql`
      INSERT INTO failed_login_attempts (username, ip_address)
      VALUES (${username}, ${ipAddress})
    `;
    
    logger.info('Recorded failed login attempt', { username, ipAddress });
  } catch (error) {
    logger.error('Error recording failed login attempt', { 
      error: error.message,
      username,
      ipAddress
    });
  }
}

/**
 * Reset failed login attempts for a username after successful login
 * @param {string} username - The username to reset attempts for
 */
export async function resetFailedLoginAttempts(username) {
  try {
    const result = await sql`
      DELETE FROM failed_login_attempts
      WHERE username = ${username}
    `;
    
    logger.info('Reset failed login attempts', { 
      username, 
      count: result.rowCount || 0
    });
  } catch (error) {
    logger.error('Error resetting failed login attempts', { 
      error: error.message,
      username
    });
  }
}

/**
 * Clean up old failed login attempts
 */
export async function cleanupFailedLoginAttempts() {
  try {
    const cutoff = new Date(Date.now() - (24 * 60 * 60 * 1000)); // 24 hours ago
    
    const result = await sql`
      DELETE FROM failed_login_attempts
      WHERE attempt_time < ${cutoff.toISOString()}
    `;
    
    logger.info('Cleaned up old failed login attempts', { 
      count: result.rowCount || 0
    });
  } catch (error) {
    logger.error('Error cleaning up failed login attempts', { 
      error: error.message
    });
  }
}

/**
 * Get failed login statistics for monitoring
 * @param {number} hours - Number of hours to look back (default: 24)
 * @returns {Object} - Statistics about failed login attempts
 */
export async function getFailedLoginStats(hours = 24) {
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
      totalAttempts: parseInt(result.rows[0]?.total_attempts || '0'),
      uniqueUsernames: parseInt(result.rows[0]?.unique_usernames || '0'),
      uniqueIPs: parseInt(result.rows[0]?.unique_ips || '0'),
      timeWindow: hours
    };
  } catch (error) {
    logger.error('Error getting failed login stats', { 
      error: error.message
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
 * Get recent failed login attempts for a specific username
 * @param {string} username - The username to check
 * @param {number} limit - Maximum number of attempts to return
 * @returns {Array} - Recent failed login attempts
 */
export async function getRecentFailedAttempts(username, limit = 10) {
  try {
    const result = await sql`
      SELECT username, ip_address, attempt_time
      FROM failed_login_attempts
      WHERE username = ${username}
      ORDER BY attempt_time DESC
      LIMIT ${limit}
    `;
    
    return result.rows;
  } catch (error) {
    logger.error('Error getting recent failed attempts', { 
      error: error.message,
      username
    });
    return [];
  }
}

/**
 * Check if an IP address has too many failed attempts across all usernames
 * @param {string} ipAddress - The IP address to check
 * @returns {Object} - IP lockout status
 */
export async function checkIPLockout(ipAddress) {
  try {
    const windowStart = new Date(Date.now() - ATTEMPT_WINDOW);
    
    const result = await sql`
      SELECT COUNT(*) as attempt_count, MAX(attempt_time) as last_attempt
      FROM failed_login_attempts
      WHERE ip_address = ${ipAddress}
      AND attempt_time > ${windowStart.toISOString()}
    `;
    
    const failedAttempts = parseInt(result.rows[0]?.attempt_count || '0');
    const lastAttemptTime = result.rows[0]?.last_attempt;
    
    // Use a higher threshold for IP-based lockout (e.g., 20 attempts)
    const IP_LOCKOUT_THRESHOLD = 20;
    
    if (failedAttempts >= IP_LOCKOUT_THRESHOLD && lastAttemptTime) {
      const lastAttempt = new Date(lastAttemptTime);
      const lockoutUntil = new Date(lastAttempt.getTime() + LOCKOUT_DURATION);
      
      if (new Date() < lockoutUntil) {
        // IP is locked
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
  } catch (error) {
    logger.error('Error checking IP lockout', { 
      error: error.message,
      ipAddress
    });
    // Default to not locked in case of error
    return { locked: false };
  }
}

