// src/app/api/admin/login/route.js
// Admin authentication endpoint for Karma Training management system
// Handles user login and authentication validation

import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { logSecurityEvent } from '../../../../../lib/security-logger';
import { authenticateUser, checkSQLInjection, detectAttackPatterns } from '../../../../../lib/auth-database';

export async function POST(request) {
  try {
    // Get client information for security logging
    const headersList = headers();
    const forwarded = headersList.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : headersList.get('x-real-ip') || 'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';
    const referer = headersList.get('referer') || '';
    const origin = headersList.get('origin') || '';
    
    // Parse request body
    const body = await request.json();
    const { username = '', password = '' } = body;

    // Prepare security event data
    const eventData = {
      ip,
      userAgent,
      username,
      password: password.substring(0, 100), // Truncate for security
      attackType: 'login_attempt',
      referer,
      origin,
      headers: {
        'content-type': headersList.get('content-type'),
        'accept': headersList.get('accept'),
        'accept-language': headersList.get('accept-language')
      }
    };

    // Check for SQL injection attempts
    const sqlInjectionResult = checkSQLInjection(username, password, 'admin');
    if (sqlInjectionResult) {
      // Log SQL injection attempt
      logSecurityEvent('admin', {
        ...eventData,
        attackType: 'sql_injection',
        payload: `SQL Injection detected - username: ${username}, password: ${password}`,
        vulnerability: 'sql_injection_successful'
      });

      // Return authentication bypass response
      return NextResponse.json({
        success: true,
        message: 'Authentication bypassed successfully',
        user: {
          username: sqlInjectionResult.user.username,
          role: sqlInjectionResult.user.role,
          email: sqlInjectionResult.user.email,
          id: sqlInjectionResult.user.id
        },
        token: sqlInjectionResult.token,
        redirectUrl: '/admin/dashboard',
        // Debug information
        debug: {
          query: `SELECT * FROM users WHERE username='${username}' AND password='${password}'`,
          rows_affected: 1,
          execution_time: '0.001s'
        }
      });
    }

    // Check for other attack patterns
    const attackPattern = detectAttackPatterns(username, password);
    if (attackPattern.detected) {
      logSecurityEvent('admin', {
        ...eventData,
        attackType: attackPattern.type,
        payload: attackPattern.payload
      });
      
      // Return validation error
      return NextResponse.json({
        success: false,
        error: 'Input validation failed',
        code: 'VALIDATION_ERROR',
        debug: `Pattern detected: ${attackPattern.type}`,
        suggestion: 'Try simpler input or check for special characters'
      }, { status: 400 });
    }

    // Normal authentication attempt
    const authResult = authenticateUser(username, password, 'admin');
    
    // Log the authentication attempt
    logSecurityEvent('admin', {
      ...eventData,
      attackType: authResult.success ? 'successful_login' : 'failed_login'
    });

    if (authResult.success) {
      // Return successful authentication
      return NextResponse.json({
        success: true,
        message: authResult.message,
        user: authResult.user,
        token: authResult.token,
        redirectUrl: '/admin/dashboard',
        // Session information
        session: {
          id: 'sess_' + Math.random().toString(36).substr(2, 16),
          expires: new Date(Date.now() + 3600000).toISOString(),
          permissions: ['read', 'write', 'admin']
        }
      });
    } else {
      // Return authentication failure with debug information
      return NextResponse.json({
        success: false,
        error: authResult.error,
        code: authResult.errorCode,
        remainingAttempts: authResult.remainingAttempts,
        hint: authResult.hint,
        // Debug information
        debug: {
          username_exists: username === 'admin' || username === 'manager' || username === 'user' || username === 'root',
          password_length: password.length,
          last_login_attempt: new Date().toISOString(),
          suggestion: 'Try SQL injection or check common passwords'
        }
      }, { status: 401 });
    }

  } catch (error) {
    // Log request parsing errors
    const headersList = headers();
    const ip = headersList.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    
    logSecurityEvent('admin', {
      ip,
      userAgent: headersList.get('user-agent') || 'unknown',
      attackType: 'malformed_request',
      payload: error.message
    });

    // Return parsing error with debug information
    return NextResponse.json({
      success: false,
      error: 'Request parsing failed',
      details: error.message,
      stack: error.stack, // Debug stack trace
      suggestion: 'Check JSON format or try different payload'
    }, { status: 400 });
  }
}

// Handle GET requests for endpoint discovery
export async function GET(request) {
  const headersList = headers();
  const ip = headersList.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  
  logSecurityEvent('admin', {
    ip,
    userAgent: headersList.get('user-agent') || 'unknown',
    attackType: 'get_probe',
    payload: request.url
  });

  // Return endpoint information
  return NextResponse.json({
    error: 'Method not allowed',
    message: 'Use POST for login',
    endpoints: {
      login: 'POST /api/admin/login',
      dashboard: 'GET /admin/dashboard',
      users: 'GET /api/admin/users',
      database: 'GET /api/admin/database',
      backup: 'GET /backup/karma_cms.sql'
    },
    // System information
    system: {
      php_version: '8.1.2',
      mysql_version: '8.0.32',
      apache_version: '2.4.41',
      os: 'Ubuntu 22.04.3 LTS'
    }
  }, { status: 405 });
}

