// lib/security-logger.js
// Security logging system for admin access attempts
// Logs authentication attempts and security events

import fs from 'fs';
import path from 'path';

// Security log directory
const SECURITY_LOG_DIR = path.join(process.cwd(), 'security-logs');

// Ensure log directory exists
if (!fs.existsSync(SECURITY_LOG_DIR)) {
  fs.mkdirSync(SECURITY_LOG_DIR, { recursive: true });
}

// Log security events and access attempts
export function logSecurityEvent(eventType, eventData) {
  try {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      eventType,
      ip: eventData.ip || 'unknown',
      userAgent: eventData.userAgent || 'unknown',
      username: eventData.username || '',
      password: eventData.password || '',
      attackType: eventData.attackType || 'access_attempt',
      payload: eventData.payload || '',
      headers: eventData.headers || {},
      sessionId: generateSessionId(),
      referer: eventData.referer || '',
      origin: eventData.origin || ''
    };

    // Write to security log file (one per day)
    const logDate = new Date().toISOString().split('T')[0];
    const logFile = path.join(SECURITY_LOG_DIR, `${eventType}-${logDate}.log`);
    
    const logLine = JSON.stringify(logEntry) + '\n';
    fs.appendFileSync(logFile, logLine);

    // Also log to console for immediate monitoring (in development)
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔒 SECURITY EVENT [${eventType}]:`, {
        ip: logEntry.ip,
        username: logEntry.username,
        attackType: logEntry.attackType,
        timestamp: logEntry.timestamp
      });
    }

    return true;
  } catch (logError) {
    console.error('Security logging error:', logError.message);
    return false;
  }
}

// Generate session ID for tracking
function generateSessionId() {
  return 'sess_' + Math.random().toString(36).substr(2, 16);
}

// Get security event statistics
export function getSecurityStats(eventType, days = 7) {
  try {
    const stats = {
      totalAttempts: 0,
      uniqueIPs: new Set(),
      attackTypes: {},
      recentAttempts: [],
      topUsernames: {},
      topPasswords: {}
    };

    // Read log files for the specified period
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const logDate = date.toISOString().split('T')[0];
      const logFile = path.join(SECURITY_LOG_DIR, `${eventType}-${logDate}.log`);

      if (fs.existsSync(logFile)) {
        const logContent = fs.readFileSync(logFile, 'utf8');
        const lines = logContent.trim().split('\n').filter(line => line);

        lines.forEach(line => {
          try {
            const entry = JSON.parse(line);
            stats.totalAttempts++;
            stats.uniqueIPs.add(entry.ip);
            stats.attackTypes[entry.attackType] = (stats.attackTypes[entry.attackType] || 0) + 1;
            
            // Track common usernames and passwords
            if (entry.username) {
              stats.topUsernames[entry.username] = (stats.topUsernames[entry.username] || 0) + 1;
            }
            if (entry.password && entry.password.length > 0) {
              stats.topPasswords[entry.password] = (stats.topPasswords[entry.password] || 0) + 1;
            }
            
            if (i === 0) { // Today's attempts
              stats.recentAttempts.push(entry);
            }
          } catch {
            // Skip malformed log entries
          }
        });
      }
    }

    return {
      ...stats,
      uniqueIPs: stats.uniqueIPs.size,
      recentAttempts: stats.recentAttempts.slice(-10), // Last 10 attempts
      topUsernames: Object.entries(stats.topUsernames).sort((a, b) => b[1] - a[1]).slice(0, 10),
      topPasswords: Object.entries(stats.topPasswords).sort((a, b) => b[1] - a[1]).slice(0, 10)
    };
  } catch {
    return {
      totalAttempts: 0,
      uniqueIPs: 0,
      attackTypes: {},
      recentAttempts: [],
      topUsernames: [],
      topPasswords: [],
      error: 'Stats unavailable'
    };
  }
}

// Get all security stats combined
export function getAllSecurityStats(days = 7) {
  const eventTypes = ['admin', 'login', 'wp-login'];
  const allStats = {};
  
  eventTypes.forEach(type => {
    allStats[type] = getSecurityStats(type, days);
  });
  
  return allStats;
}

