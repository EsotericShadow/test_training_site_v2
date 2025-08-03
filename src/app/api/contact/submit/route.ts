/*
 * Karma Industrial Safety Training Website
 * Written and developed by Gabriel Lacroix for Evergreen Web Solutions
 *
 * File: src/app/api/contact/submit/route.ts
 * Description: API route for handling contact form submissions, including security checks, validation, and data storage.
 * Dependencies: Next.js, Vercel Postgres, security-utils, csrf
 * Created: 2025-07-17
 * Last Modified: 2025-08-03
 * Version: 1.0.2
 */
// src/app/api/contact/submit/route.ts
import { NextResponse, NextRequest } from 'next/server';

export const runtime = 'nodejs';
import { sql } from '@vercel/postgres';
import { 
  validateInput, 
  rateLimiter, 
  securityHeaders 
} from '../../../../../lib/security-utils';
import { validateToken } from '../../../../../lib/csrf';

// Rate limiting store (use Redis in production)
const submissionAttempts = new Map<string, number>();

interface SubmissionData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  trainingType?: string;
  message: string;
  timeSpent: number;
  securityScore: number;
  sessionId: string;
  csrfToken: string;
}

interface WebhookData extends SubmissionData {
  submissionId: string;
  ip: string;
  userAgent: string;
}

export async function POST(request: NextRequest) {
  try {
    // Get client information
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() ?? request.headers.get('x-real-ip') ?? 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const referer = request.headers.get('referer') || '';

    // Parse and validate request body
    const body: SubmissionData = await request.json();

    // Security checks
    const securityChecks = await performSecurityChecks(ip, userAgent, referer, body);
    if (!securityChecks.passed) {
      return NextResponse.json(
        { error: securityChecks.error || 'An unknown security error occurred.' },
        { status: securityChecks.status ?? 400 }
      );
    }
    
    const validationResult = validateSubmission(body);
    if (!validationResult.isValid) {
      return NextResponse.json(
        { error: validationResult.error },
        { status: 400 }
      );
    }

    // Additional security validations
    const additionalChecks = performAdditionalSecurityChecks(body, ip);
    if (!additionalChecks.passed) {
      return NextResponse.json(
        { error: additionalChecks.error },
        { status: 403 }
      );
    }

    // Process the submission
    const processResult = await processSubmission(validationResult.data!, ip, userAgent);
    if (!processResult.success) {
      return NextResponse.json(
        { error: processResult.error },
        { status: 500 }
      );
    }

    // Log successful submission
    console.log('Contact form submission successful:', {
      ip,
      timestamp: new Date().toISOString(),
      email: validationResult.data!.email,
      company: validationResult.data!.company || 'none',
      submissionId: processResult.submissionId
    });

    // Create response with security headers
    const response = NextResponse.json({
      success: true,
      message: 'Message sent successfully',
      submissionId: processResult.submissionId
    });

    // Add security headers
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value as string);
    });

    return response;

  } catch (submissionError) {
    console.error('Contact form submission error:', submissionError);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}

// Perform comprehensive security checks
async function performSecurityChecks(ip: string, userAgent: string, referer: string, body: SubmissionData) {
  // Rate limiting check
  if (rateLimiter.isRateLimited(ip, 3, 15 * 60 * 1000)) { // 3 submissions per 15 minutes
    return {
      passed: false,
      error: 'Too many submissions. Please wait before trying again.',
      status: 429
    };
  }

  // Check for suspicious user agents
  const suspiciousAgents = [
    /bot/i, /crawler/i, /spider/i, /scraper/i,
    /curl/i, /wget/i, /python/i, /php/i
  ];
  
  if (suspiciousAgents.some(pattern => pattern.test(userAgent))) {
    return {
      passed: false,
      error: 'Automated requests are not allowed.',
      status: 403
    };
  }

  // Check referer (should be from same domain in production)
  if (process.env.NODE_ENV === 'production') {
    const allowedDomains = [
      process.env.NEXT_PUBLIC_DOMAIN,
      'test-training-site-v2-xjey.vercel.app',
      'www.test-training-site-v2-xjey.vercel.app'
    ].filter(Boolean);

    const refererDomain = referer ? new URL(referer).hostname : '';
    if (referer && !allowedDomains.some(domain => refererDomain.includes(domain!))) {
      return {
        passed: false,
        error: 'Invalid request origin.',
        status: 403
      };
    }
  }

  // Strong, server-side CSRF token validation
  const { sessionId, csrfToken } = body;
  if (typeof sessionId !== 'string' || isNaN(Number(sessionId))) {
    return {
      passed: false,
      error: 'Invalid session ID.',
      status: 400
    };
  }
  const isTokenValid = await validateToken(Number(sessionId), csrfToken);

  if (!isTokenValid) {
    return {
      passed: false,
      error: 'Invalid security token. Please refresh the page and try again.',
      status: 403
    };
  }

  return { passed: true };
}

// Validate and sanitize submission data
function validateSubmission(body: SubmissionData) {
  try {
    // Check for required fields
    if (!body || typeof body !== 'object') {
      return { isValid: false, error: 'Invalid request data' };
    }

    // Honeypot check
    const honeypotFields = ['website', 'url', 'homepage', 'link', 'address'];
    const bodyWithHoneypot = body as SubmissionData & { [key: string]: unknown };
    for (const field of honeypotFields) {
      const value = bodyWithHoneypot[field];
      if (value && typeof value === 'string' && value.trim().length > 0) {
        return { isValid: false, error: 'Bot detected' };
      }
    }

    // Validate and sanitize each field
    const validations = {
      name: validateInput.name(body.name),
      email: validateInput.email(body.email),
      phone: validateInput.phone(body.phone ?? ''),
      company: validateInput.company(body.company ?? ''),
      trainingType: validateInput.trainingType(body.trainingType ?? ''),
      message: validateInput.message(body.message)
    };

    // Check for validation errors
    const errors = Object.entries(validations)
      .filter(([, validation]) => !validation.isValid)
      .map(([field, validation]) => `${field}: ${(validation as { error: string }).error}`);

    if (errors.length > 0) {
      return { isValid: false, error: errors.join(', ') };
    }

    // Return sanitized data
    const sanitizedData = Object.fromEntries(
      Object.entries(validations).map(([key, validation]) => [key, (validation as { value: string }).value])
    );

    return { isValid: true, data: sanitizedData as unknown as SubmissionData };

  } catch (validationError) {
    console.error('Validation error:', validationError);
    return { isValid: false, error: 'Data validation failed' };
  }
}

// Perform additional security checks
function performAdditionalSecurityChecks(body: SubmissionData, ip: string) {
  // Check submission timing
  if (body.timeSpent < 3000) { // Less than 3 seconds
    return {
      passed: false,
      error: 'Form submitted too quickly. Please take your time.'
    };
  }

  if (body.timeSpent > 30 * 60 * 1000) { // More than 30 minutes
    return {
      passed: false,
      error: 'Session expired. Please refresh the page and try again.'
    };
  }

  // Check security score
  if (body.securityScore < 50) {
    return {
      passed: false,
      error: 'Security validation failed. Please try again.'
    };
  }

  // Check for duplicate submissions
  const submissionKey = `${ip}_${body.email}`;
  const now = Date.now();
  const lastSubmission = submissionAttempts.get(submissionKey);

  if (lastSubmission && (now - lastSubmission) < 60000) { // 1 minute
    return {
      passed: false,
      error: 'Duplicate submission detected. Please wait before submitting again.'
    };
  }

  // Record this submission attempt
  submissionAttempts.set(submissionKey, now);

  // Clean up old entries
  for (const [key, timestamp] of submissionAttempts.entries()) {
    if (now - timestamp > 60000) {
      submissionAttempts.delete(key);
    }
  }

  return { passed: true };
}

// Send submission to a configured webhook (e.g., Zapier)
async function sendToWebhook(data: WebhookData) {
  const webhookUrl = process.env.ZAPIER_WEBHOOK_URL;

  if (!webhookUrl) {
    // This is not a client-facing error, but a server configuration issue.
    // Log it for the admin, but don't fail the user's submission, as it's already saved.
    console.warn('ZAPIER_WEBHOOK_URL is not configured. Skipping webhook notification.');
    return;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      // Log the error but don't throw, as the data is already saved.
      const errorBody = await response.text();
      console.error('Failed to send webhook notification', {
        status: response.status,
        statusText: response.statusText,
        body: errorBody,
      });
    } else {
      console.log('Webhook notification sent successfully.');
    }
  } catch (error) {
    console.error('Error sending webhook notification:', error);
  }
}

// Process the validated submission
async function processSubmission(data: SubmissionData, ip: string, userAgent: string) {
  try {
    // Generate submission ID
    const submissionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Store submission in database first
    await storeSubmission(data, submissionId, ip, userAgent);

    // Send the data to the configured webhook
    await sendToWebhook({ ...data, submissionId, ip, userAgent });

    return { success: true, submissionId };

  } catch (processError) {
    console.error('Submission processing error:', processError);
    return { success: false, error: 'Failed to process submission' };
  }
}

// Store submission in database
async function storeSubmission(data: SubmissionData, submissionId: string, ip: string, userAgent: string) {
  try {
    await sql`
      INSERT INTO contact_submissions 
      (submission_id, name, email, company, phone, training_type, message, ip_address, user_agent, created_at)
      VALUES (
        ${submissionId}, 
        ${data.name}, 
        ${data.email}, 
        ${data.company || null}, 
        ${data.phone || null}, 
        ${data.trainingType || null}, 
        ${data.message}, 
        ${ip}, 
        ${userAgent}, 
        CURRENT_TIMESTAMP
      )
    `;
    
    console.log('Submission stored successfully:', submissionId);
  } catch (storageError) {
    console.error('Failed to store submission:', storageError);
    // Re-throw error to fail the entire process if database storage fails
    throw new Error('Database storage failed');
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