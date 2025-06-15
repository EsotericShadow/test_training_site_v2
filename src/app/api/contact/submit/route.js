// src/app/api/contact/submit/route.js
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { sql } from '@vercel/postgres';
import { 
  validateInput, 
  rateLimiter, 
  securityHeaders 
} from '../../../../../lib/security-utils';
import nodemailer from 'nodemailer';

// Rate limiting store (use Redis in production)
const submissionAttempts = new Map();

export async function POST(request) {
  try {
    // Get client information
    const headersList = headers();
    const forwarded = headersList.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : headersList.get('x-real-ip') || 'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';
    const referer = headersList.get('referer') || '';

    // Security checks
    const securityChecks = await performSecurityChecks(request, ip, userAgent, referer);
    if (!securityChecks.passed) {
      return NextResponse.json(
        { error: securityChecks.error },
        { status: securityChecks.status }
      );
    }

    // Parse and validate request body
    const body = await request.json();
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
    const processResult = await processSubmission(validationResult.data, ip, userAgent);
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
      email: validationResult.data.email,
      company: validationResult.data.company,
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
      response.headers.set(key, value);
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
async function performSecurityChecks(request, ip, userAgent, referer) {
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
    if (referer && !allowedDomains.some(domain => refererDomain.includes(domain))) {
      return {
        passed: false,
        error: 'Invalid request origin.',
        status: 403
      };
    }
  }

  // CSRF token validation
  const csrfToken = request.headers.get('x-csrf-token');
  const cookieToken = request.cookies.get('csrf-token')?.value;
  
  if (!csrfToken || !cookieToken || csrfToken !== cookieToken) {
    return {
      passed: false,
      error: 'Invalid security token. Please refresh the page and try again.',
      status: 403
    };
  }

  return { passed: true };
}

// Validate and sanitize submission data
function validateSubmission(body) {
  try {
    // Check for required fields
    if (!body || typeof body !== 'object') {
      return { isValid: false, error: 'Invalid request data' };
    }

    // Honeypot check
    const honeypotFields = ['website', 'url', 'homepage', 'link', 'address'];
    for (const field of honeypotFields) {
      if (body[field] && body[field].trim().length > 0) {
        return { isValid: false, error: 'Bot detected' };
      }
    }

    // Validate and sanitize each field
    const validations = {
      name: validateInput.name(body.name),
      email: validateInput.email(body.email),
      phone: validateInput.phone(body.phone),
      company: validateInput.company(body.company),
      trainingType: validateInput.trainingType(body.trainingType),
      message: validateInput.message(body.message)
    };

    // Check for validation errors
    const errors = Object.entries(validations)
      .filter(([, validation]) => !validation.isValid)
      .map(([field, validation]) => `${field}: ${validation.error}`);

    if (errors.length > 0) {
      return { isValid: false, error: errors.join(', ') };
    }

    // Return sanitized data
    const sanitizedData = Object.fromEntries(
      Object.entries(validations).map(([key, validation]) => [key, validation.value])
    );

    return { isValid: true, data: sanitizedData };

  } catch (validationError) {
    console.error('Validation error:', validationError);
    return { isValid: false, error: 'Data validation failed' };
  }
}

// Perform additional security checks
function performAdditionalSecurityChecks(body, ip) {
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

// Process the validated submission
async function processSubmission(data, ip, userAgent) {
  try {
    // Generate submission ID
    const submissionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Store submission in database first
    await storeSubmission(data, submissionId, ip, userAgent);

    // Prepare and send email
    const emailContent = {
      to: process.env.CONTACT_EMAIL || 'info@karmatraining.ca',
      subject: `New Contact Form Submission - ${data.trainingType || 'General Inquiry'}`,
      html: generateEmailHTML(data, submissionId, ip, userAgent),
      text: generateEmailText(data, submissionId)
    };

    await sendEmail(emailContent);

    return { success: true, submissionId };

  } catch (processError) {
    console.error('Submission processing error:', processError);
    return { success: false, error: 'Failed to process submission' };
  }
}

// Store submission in database
async function storeSubmission(data, submissionId, ip, userAgent) {
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

// Generate HTML email content
function generateEmailHTML(data, submissionId, ip, userAgent) {
  const trainingTypeLabels = {
    'kist-orientation': 'KIST Orientation to Workplace Safety',
    'whmis': 'WHMIS 2018 GHS',
    'fall-protection': 'Fall Protection',
    'confined-space': 'Confined Space Entry',
    'equipment-training': 'Equipment Operator Training',
    'custom': 'Custom Training Program',
    'consultation': 'Safety Consultation',
    'other': 'Other'
  };

  const trainingLabel = data.trainingType ? trainingTypeLabels[data.trainingType] || data.trainingType : 'Not specified';

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>New Contact Form Submission</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f8b500; color: #000; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #555; display: block; margin-bottom: 5px; }
            .value { padding: 10px; background: #fff; border-left: 4px solid #f8b500; border-radius: 4px; }
            .footer { background: #333; color: #fff; padding: 15px; text-align: center; font-size: 12px; margin-top: 20px; border-radius: 4px; }
            .urgent { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 4px; margin-bottom: 20px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚨 New Contact Form Submission</h1>
                <p><strong>Karma Training - Contact Form</strong></p>
            </div>
            
            ${data.trainingType && data.trainingType !== 'other' ? `
            <div class="urgent">
                <strong>⚡ Training Request:</strong> ${trainingLabel}
            </div>
            ` : ''}
            
            <div class="content">
                <div class="field">
                    <span class="label">👤 Name:</span>
                    <div class="value">${data.name}</div>
                </div>
                
                <div class="field">
                    <span class="label">📧 Email:</span>
                    <div class="value"><a href="mailto:${data.email}">${data.email}</a></div>
                </div>
                
                ${data.company ? `
                <div class="field">
                    <span class="label">🏢 Company:</span>
                    <div class="value">${data.company}</div>
                </div>
                ` : ''}
                
                ${data.phone ? `
                <div class="field">
                    <span class="label">📞 Phone:</span>
                    <div class="value"><a href="tel:${data.phone}">${data.phone}</a></div>
                </div>
                ` : ''}
                
                <div class="field">
                    <span class="label">🎯 Training Interest:</span>
                    <div class="value">${trainingLabel}</div>
                </div>
                
                <div class="field">
                    <span class="label">💬 Message:</span>
                    <div class="value">${data.message.replace(/\n/g, '<br>')}</div>
                </div>
            </div>
            
            <div class="footer">
                <p><strong>Submission Details</strong></p>
                <p>ID: ${submissionId}</p>
                <p>Submitted: ${new Date().toLocaleString('en-CA', { timeZone: 'America/Vancouver' })} PST</p>
                <p>IP: ${ip}</p>
                <p>User Agent: ${userAgent.substring(0, 100)}${userAgent.length > 100 ? '...' : ''}</p>
            </div>
        </div>
    </body>
    </html>
  `;
}

// Generate plain text email content
function generateEmailText(data, submissionId) {
  const trainingTypeLabels = {
    'kist-orientation': 'KIST Orientation to Workplace Safety',
    'whmis': 'WHMIS 2018 GHS',
    'fall-protection': 'Fall Protection',
    'confined-space': 'Confined Space Entry',
    'equipment-training': 'Equipment Operator Training',
    'custom': 'Custom Training Program',
    'consultation': 'Safety Consultation',
    'other': 'Other'
  };

  const trainingLabel = data.trainingType ? trainingTypeLabels[data.trainingType] || data.trainingType : 'Not specified';

  return `
🚨 NEW CONTACT FORM SUBMISSION - KARMA TRAINING

👤 Name: ${data.name}
📧 Email: ${data.email}
${data.company ? `🏢 Company: ${data.company}` : ''}
${data.phone ? `📞 Phone: ${data.phone}` : ''}
🎯 Training Interest: ${trainingLabel}

💬 Message:
${data.message}

---
📋 Submission Details:
ID: ${submissionId}
Submitted: ${new Date().toLocaleString('en-CA', { timeZone: 'America/Vancouver' })} PST

⚡ Action Required: Please respond within 24 hours as per company policy.
  `;
}

// Send email using nodemailer
async function sendEmail(emailContent) {
  // Create transporter based on environment
  let transporter;

  if (process.env.EMAIL_SERVICE === 'gmail') {
    // Gmail configuration
    transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  } else if (process.env.SMTP_HOST) {
    // SMTP configuration
    transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } else {
    throw new Error('No email service configured');
  }

  // Send email
  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'noreply@karmatraining.ca',
    to: emailContent.to,
    subject: emailContent.subject,
    text: emailContent.text,
    html: emailContent.html,
    replyTo: emailContent.replyTo || undefined
  });

  console.log('Email sent successfully:', info.messageId);
  return info;
}

