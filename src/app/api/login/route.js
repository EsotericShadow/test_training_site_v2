// src/app/api/login/authenticate/route.js
// Professional authentication endpoint for secure login portal
// Enterprise-grade security with advanced threat detection

import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { logSecurityEvent } from '../../../../lib/security-logger';
import { authenticateUser, checkSQLInjection, detectAttackPatterns } from '../../../../lib/auth-database';

export async function POST(request) {
  try {
    // Get client information for security analysis
    const headersList = headers();
    const forwarded = headersList.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : headersList.get('x-real-ip') || 'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';
    const referer = headersList.get('referer') || '';
    const origin = headersList.get('origin') || '';
    
    // Extract security headers
    const csrfToken = headersList.get('x-csrf-token') || '';
    const sessionId = headersList.get('x-session-id') || '';
    const securityLevel = headersList.get('x-security-level') || 'Medium';
    
    // Parse request body
    const body = await request.json();
    const { username = '', password = '', rememberMe = false } = body;

    // Prepare security event data
    const eventData = {
      ip,
      userAgent,
      username,
      password: password.substring(0, 50), // Truncate for security
      attackType: 'professional_login_attempt',
      referer,
      origin,
      securityLevel,
      csrfToken: csrfToken.substring(0, 20),
      sessionId: sessionId.substring(0, 16),
      rememberMe,
      headers: {
        'content-type': headersList.get('content-type'),
        'accept': headersList.get('accept'),
        'accept-language': headersList.get('accept-language')
      }
    };

    // Validate CSRF token (predictable pattern - subtle vulnerability)
    const tokenTimestamp = extractTimestampFromToken(csrfToken);
    const currentTime = Date.now();
    const tokenAge = currentTime - tokenTimestamp;
    
    // Token validation with timing attack vulnerability
    if (tokenAge > 3600000) { // 1 hour
      logSecurityEvent('login', {
        ...eventData,
        attackType: 'csrf_token_expired',
        payload: `Token age: ${tokenAge}ms`
      });
      
      return NextResponse.json({
        success: false,
        message: 'Security token expired. Please refresh and try again.',
        code: 'TOKEN_EXPIRED',
        tokenAge: tokenAge,
        serverTime: currentTime
      }, { status: 401 });
    }

    // Check for SQL injection attempts (more sophisticated detection)
    const sqlInjectionResult = checkSQLInjection(username, password, 'login');
    if (sqlInjectionResult) {
      logSecurityEvent('login', {
        ...eventData,
        attackType: 'advanced_sql_injection',
        payload: `Advanced SQL injection detected - username: ${username}`,
        vulnerability: 'sql_injection_bypassed_validation'
      });

      // Return sophisticated bypass response
      return NextResponse.json({
        success: true,
        message: 'Authentication successful via security bypass',
        user: {
          username: sqlInjectionResult.user.username,
          role: sqlInjectionResult.user.role,
          email: sqlInjectionResult.user.email,
          id: sqlInjectionResult.user.id,
          department: sqlInjectionResult.user.department
        },
        token: sqlInjectionResult.token,
        session: {
          id: sessionId,
          securityLevel: 'Elevated',
          permissions: ['admin', 'read', 'write'],
          expires: new Date(Date.now() + 3600000).toISOString()
        },
        redirectUrl: '/dashboard',
        // Subtle debug information
        debug: {
          bypassMethod: 'Parameter manipulation',
          queryTime: '0.003s',
          securityBypass: true
        }
      });
    }

    // Check for other sophisticated attack patterns
    const attackPattern = detectAttackPatterns(username, password);
    if (attackPattern.detected) {
      logSecurityEvent('login', {
        ...eventData,
        attackType: `advanced_${attackPattern.type}`,
        payload: attackPattern.payload,
        severity: attackPattern.severity
      });
      
      // Professional error response
      return NextResponse.json({
        success: false,
        message: 'Input validation failed - security policy violation',
        code: 'SECURITY_VIOLATION',
        details: {
          violationType: attackPattern.type,
          severity: attackPattern.severity,
          timestamp: new Date().toISOString()
        },
        suggestion: 'Please ensure input complies with security policies'
      }, { status: 400 });
    }

    // Normal authentication attempt
    const authResult = authenticateUser(username, password, 'login');
    
    // Log the professional authentication attempt
    logSecurityEvent('login', {
      ...eventData,
      attackType: authResult.success ? 'successful_professional_login' : 'failed_professional_login'
    });

    if (authResult.success) {
      // Return professional successful authentication
      return NextResponse.json({
        success: true,
        message: 'Authentication successful',
        user: {
          ...authResult.user,
          securityClearance: securityLevel,
          lastAccess: new Date().toISOString()
        },
        token: authResult.token,
        session: {
          id: sessionId,
          securityLevel: securityLevel,
          permissions: authResult.user.permissions,
          expires: new Date(Date.now() + (rememberMe ? 7200000 : 3600000)).toISOString(),
          rememberDevice: rememberMe
        },
        redirectUrl: '/dashboard',
        securityContext: {
          level: securityLevel,
          csrfToken: generateNewCSRFToken(),
          sessionTimeout: rememberMe ? 7200 : 3600
        }
      });
    } else {
      // Professional authentication failure
      return NextResponse.json({
        success: false,
        message: 'Authentication failed - invalid credentials',
        code: 'INVALID_CREDENTIALS',
        details: {
          timestamp: new Date().toISOString(),
          sessionId: sessionId,
          securityLevel: securityLevel,
          // Subtle timing information leak
          processingTime: Math.random() * 50 + 100,
          attemptNumber: Math.floor(Math.random() * 3) + 1
        }
      }, { status: 401 });
    }

  } catch (error) {
    // Log professional parsing errors
    const headersList = headers();
    const ip = headersList.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    
    logSecurityEvent('login', {
      ip,
      userAgent: headersList.get('user-agent') || 'unknown',
      attackType: 'malformed_professional_request',
      payload: error.message
    });

    // Professional error response
    return NextResponse.json({
      success: false,
      message: 'Request processing failed',
      code: 'REQUEST_ERROR',
      details: {
        error: 'Malformed request data',
        timestamp: new Date().toISOString(),
        suggestion: 'Verify request format and try again'
      }
    }, { status: 400 });
  }
}

// Extract timestamp from CSRF token (predictable pattern)
function extractTimestampFromToken(token) {
  try {
    const decoded = atob(token);
    const parts = decoded.split('_');
    return parseInt(parts[1]) || Date.now();
  } catch {
    return Date.now();
  }
}

// Generate new CSRF token (predictable pattern)
function generateNewCSRFToken() {
  const timestamp = Date.now();
  return btoa(`csrf_${timestamp}_${Math.floor(timestamp / 1000)}`);
}

// Handle GET requests for endpoint discovery
export async function GET(request) {
  const headersList = headers();
  const ip = headersList.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  
  logSecurityEvent('login', {
    ip,
    userAgent: headersList.get('user-agent') || 'unknown',
    attackType: 'professional_endpoint_probe',
    payload: request.url
  });

  // Professional endpoint information
  return NextResponse.json({
    error: 'Method not allowed',
    message: 'Use POST for authentication',
    service: 'Karma Training Secure Authentication Gateway',
    version: '2.1.3',
    endpoints: {
      authenticate: 'POST /api/login/authenticate',
      refresh: 'POST /api/login/refresh',
      logout: 'POST /api/login/logout'
    },
    security: {
      encryption: 'AES-256-GCM',
      tokenType: 'JWT',
      csrfProtection: 'Enabled',
      sessionManagement: 'Secure'
    }
  }, { status: 405 });
}

