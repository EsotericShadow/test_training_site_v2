// src/app/api/wp-login/authenticate/route.js
// WordPress authentication endpoint for wp-login honeypot
// Mimics WordPress wp-login.php behavior

import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { logSecurityEvent } from '../../../../lib/security-logger';
import { authenticateUser, checkSQLInjection, detectAttackPatterns } from '../../../../lib/auth-database';

export async function POST(request) {
  try {
    // Get client information
    const headersList = headers();
    const forwarded = headersList.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : headersList.get('x-real-ip') || 'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';
    const referer = headersList.get('referer') || '';
    
    // Parse WordPress form data (application/x-www-form-urlencoded)
    const formData = await request.formData();
    const log = formData.get('log') || '';
    const pwd = formData.get('pwd') || '';
    const rememberme = formData.get('rememberme') === 'on';
    const redirectTo = formData.get('redirect_to') || '/wp-admin/';
    const wpNonce = formData.get('_wpnonce') || '';

    // Prepare WordPress-style event data
    const eventData = {
      ip,
      userAgent,
      username: log,
      password: pwd.substring(0, 50),
      attackType: 'wordpress_login_attempt',
      referer,
      wpNonce: wpNonce.substring(0, 20),
      redirectTo,
      rememberme,
      headers: {
        'content-type': headersList.get('content-type'),
        'accept': headersList.get('accept')
      }
    };

    // Check for WordPress-specific SQL injection
    const sqlInjectionResult = checkSQLInjection(log, pwd, 'wp-login');
    if (sqlInjectionResult) {
      logSecurityEvent('wp-login', {
        ...eventData,
        attackType: 'wordpress_sql_injection',
        payload: `WordPress SQL injection - log: ${log}, pwd: ${pwd}`,
        vulnerability: 'wp_sql_injection_successful'
      });

      // WordPress-style authentication bypass
      return NextResponse.json({
        success: true,
        message: 'Login successful',
        redirect_to: redirectTo,
        user: {
          ID: sqlInjectionResult.user.id,
          user_login: sqlInjectionResult.user.username,
          user_email: sqlInjectionResult.user.email,
          display_name: sqlInjectionResult.user.display_name || sqlInjectionResult.user.username,
          user_registered: '2024-01-15 12:00:00',
          roles: ['administrator']
        },
        // WordPress debug info
        debug: {
          wp_version: '6.4.2',
          query: `SELECT * FROM wp_users WHERE user_login='${log}' AND user_pass=MD5('${pwd}')`,
          login_method: 'sql_bypass',
          session_token: 'wp_sess_' + Math.random().toString(36)
        }
      });
    }

    // Check for other attack patterns
    const attackPattern = detectAttackPatterns(log, pwd);
    if (attackPattern.detected) {
      logSecurityEvent('wp-login', {
        ...eventData,
        attackType: `wordpress_${attackPattern.type}`,
        payload: attackPattern.payload
      });
      
      // WordPress-style error
      return NextResponse.json({
        success: false,
        message: 'Invalid username or password.',
        error_code: 'invalid_credentials',
        wp_error: {
          code: 'invalid_username',
          message: 'Invalid username or password.',
          data: null
        }
      }, { status: 401 });
    }

    // Normal WordPress authentication
    const authResult = authenticateUser(log, pwd, 'wp-login');
    
    // Log WordPress authentication attempt
    logSecurityEvent('wp-login', {
      ...eventData,
      attackType: authResult.success ? 'successful_wp_login' : 'failed_wp_login'
    });

    if (authResult.success) {
      // WordPress-style successful login
      return NextResponse.json({
        success: true,
        message: 'Login successful',
        redirect_to: redirectTo,
        user: {
          ID: authResult.user.id,
          user_login: authResult.user.username,
          user_email: authResult.user.email,
          display_name: authResult.user.firstName || authResult.user.username,
          user_registered: '2024-01-15 12:00:00',
          roles: [authResult.user.role]
        },
        session: {
          session_token: 'wp_sess_' + Math.random().toString(36).substr(2, 16),
          expiration: Math.floor(Date.now() / 1000) + (rememberme ? 1209600 : 172800), // 14 days or 2 days
          remember: rememberme
        },
        // WordPress metadata
        wp_info: {
          version: '6.4.2',
          theme: 'Twenty Twenty-Four',
          plugins: ['yoast-seo', 'contact-form-7', 'woocommerce'],
          multisite: false
        }
      });
    } else {
      // WordPress-style authentication failure
      return NextResponse.json({
        success: false,
        message: 'Invalid username or password.',
        error_code: 'invalid_credentials',
        wp_error: {
          code: 'invalid_username',
          message: 'Invalid username or password.',
          data: null
        },
        // WordPress debug hints
        debug: {
          user_exists: ['admin', 'siteadmin', 'wordpress'].includes(log.toLowerCase()),
          password_hint: 'Try common WordPress passwords',
          wp_version: '6.4.2'
        }
      }, { status: 401 });
    }

  } catch (error) {
    // Log WordPress parsing errors
    const headersList = headers();
    const ip = headersList.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    
    logSecurityEvent('wp-login', {
      ip,
      userAgent: headersList.get('user-agent') || 'unknown',
      attackType: 'wordpress_malformed_request',
      payload: error.message
    });

    // WordPress-style error response
    return NextResponse.json({
      success: false,
      message: 'There has been a critical error on this website.',
      wp_error: {
        code: 'wp_die',
        message: 'WordPress database error',
        data: null
      }
    }, { status: 500 });
  }
}

// Handle GET requests (WordPress login page access)
export async function GET(request) {
  const headersList = headers();
  const ip = headersList.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  
  logSecurityEvent('wp-login', {
    ip,
    userAgent: headersList.get('user-agent') || 'unknown',
    attackType: 'wordpress_login_page_access',
    payload: request.url
  });

  // WordPress-style login page info
  return NextResponse.json({
    message: 'WordPress Login',
    version: '6.4.2',
    login_url: '/wp-login.php',
    powered_by: 'WordPress',
    site_info: {
      name: 'Karma Training',
      description: 'Safety Training & Certification',
      wordpress_version: '6.4.2',
      theme: 'Twenty Twenty-Four'
    }
  });
}

