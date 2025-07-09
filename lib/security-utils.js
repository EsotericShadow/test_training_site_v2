// lib/security-utils.js
import DOMPurify from 'isomorphic-dompurify';
import validator from 'validator';

// Input sanitization utilities
export const sanitizeInput = {
  // Sanitize text input - removes HTML, scripts, and dangerous characters
  text: (input) => {
    if (!input || typeof input !== 'string') return '';
    
    // Remove HTML tags and scripts
    let sanitized = DOMPurify.sanitize(input, { 
      ALLOWED_TAGS: [], 
      ALLOWED_ATTR: [] 
    });
    
    // Remove potentially dangerous characters
    sanitized = sanitized.replace(/[<>\"'%;()&+]/g, '');
    
    // Trim whitespace and limit length
    return sanitized.trim().substring(0, 1000);
  },

  // Sanitize email input
  email: (input) => {
    if (!input || typeof input !== 'string') return '';
    
    // Basic sanitization
    let sanitized = input.toLowerCase().trim();
    
    // Remove dangerous characters but keep email-valid ones
    sanitized = sanitized.replace(/[^a-z0-9@._-]/g, '');
    
    return sanitized.substring(0, 254); // RFC 5321 limit
  },

  // Sanitize phone input
  phone: (input) => {
    if (!input || typeof input !== 'string') return '';
    
    // Keep only numbers, spaces, hyphens, parentheses, and plus
    let sanitized = input.replace(/[^0-9\s\-\(\)\+\.]/g, '');
    
    return sanitized.trim().substring(0, 20);
  },

  // Sanitize company name
  company: (input) => {
    if (!input || typeof input !== 'string') return '';
    
    // Allow letters, numbers, spaces, and basic punctuation
    let sanitized = input.replace(/[^a-zA-Z0-9\s\.\,\&\-\']/g, '');
    
    return sanitized.trim().substring(0, 200);
  },

  // Sanitize message content
  message: (input) => {
    if (!input || typeof input !== 'string') return '';
    
    // Remove HTML but allow basic punctuation
    let sanitized = DOMPurify.sanitize(input, { 
      ALLOWED_TAGS: [], 
      ALLOWED_ATTR: [] 
    });
    
    // Remove script-like patterns
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    sanitized = sanitized.replace(/javascript:/gi, '');
    sanitized = sanitized.replace(/on\w+\s*=/gi, '');
    
    return sanitized.trim().substring(0, 5000);
  }
};

// Validation utilities
export const validateInput = {
  // Validate name
  name: (name) => {
    if (!name || typeof name !== 'string') {
      return { isValid: false, error: 'Name is required' };
    }
    
    const sanitized = sanitizeInput.text(name);
    
    if (sanitized.length < 2) {
      return { isValid: false, error: 'Name must be at least 2 characters' };
    }
    
    if (sanitized.length > 100) {
      return { isValid: false, error: 'Name must be less than 100 characters' };
    }
    
    // Check for valid name pattern (letters, spaces, hyphens, apostrophes)
    if (!/^[a-zA-Z\s\-\'\.]+$/.test(sanitized)) {
      return { isValid: false, error: 'Name contains invalid characters' };
    }
    
    return { isValid: true, value: sanitized };
  },

  // Validate email
  email: (email) => {
    if (!email || typeof email !== 'string') {
      return { isValid: false, error: 'Email is required' };
    }
    
    const sanitized = sanitizeInput.email(email);
    
    if (!validator.isEmail(sanitized)) {
      return { isValid: false, error: 'Please enter a valid email address' };
    }
    
    // Additional security checks
    if (sanitized.includes('..')) {
      return { isValid: false, error: 'Invalid email format' };
    }
    
    return { isValid: true, value: sanitized };
  },

  // Validate phone
  phone: (phone) => {
    if (!phone) return { isValid: true, value: '' }; // Optional field
    
    if (typeof phone !== 'string') {
      return { isValid: false, error: 'Invalid phone format' };
    }
    
    const sanitized = sanitizeInput.phone(phone);
    
    // Remove all non-digits for validation
    const digitsOnly = sanitized.replace(/\D/g, '');
    
    if (digitsOnly.length < 10 || digitsOnly.length > 15) {
      return { isValid: false, error: 'Phone number must be 10-15 digits' };
    }
    
    return { isValid: true, value: sanitized };
  },

  // Validate company
  company: (company) => {
    if (!company) return { isValid: true, value: '' }; // Optional field
    
    if (typeof company !== 'string') {
      return { isValid: false, error: 'Invalid company format' };
    }
    
    const sanitized = sanitizeInput.company(company);
    
    if (sanitized.length > 200) {
      return { isValid: false, error: 'Company name must be less than 200 characters' };
    }
    
    return { isValid: true, value: sanitized };
  },

  // Validate training type
  trainingType: (trainingType) => {
    if (!trainingType) return { isValid: true, value: '' }; // Optional field
    
    const validTypes = [
      'kist-orientation',
      'whmis',
      'fall-protection',
      'confined-space',
      'equipment-training',
      'custom',
      'consultation',
      'other'
    ];
    
    if (!validTypes.includes(trainingType)) {
      return { isValid: false, error: 'Invalid training type selected' };
    }
    
    return { isValid: true, value: trainingType };
  },

  // Validate message
  message: (message) => {
    if (!message || typeof message !== 'string') {
      return { isValid: false, error: 'Message is required' };
    }
    
    const sanitized = sanitizeInput.message(message);
    
    if (sanitized.length < 10) {
      return { isValid: false, error: 'Message must be at least 10 characters' };
    }
    
    if (sanitized.length > 5000) {
      return { isValid: false, error: 'Message must be less than 5000 characters' };
    }
    
    // Check for spam patterns
    const spamPatterns = [
      /\b(viagra|cialis|casino|lottery|winner|congratulations)\b/i,
      /\b(click here|free money|make money fast)\b/i,
      /\b(urgent|act now|limited time)\b/i,
      /(http|https|www\.)/i, // No URLs allowed
      /\b\d{4}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{4}\b/, // Credit card patterns
    ];
    
    for (const pattern of spamPatterns) {
      if (pattern.test(sanitized)) {
        return { isValid: false, error: 'Message contains prohibited content' };
      }
    }
    
    return { isValid: true, value: sanitized };
  },

  // Validate file metadata
  fileMetadata: (data) => {
    // Validate category (required)
    if (!data.category || typeof data.category !== 'string') {
      return { success: false, error: 'Category is required' };
    }
    
    const allowedCategories = ['general', 'team-photos', 'course-images', 'testimonials', 'company', 'other'];
    if (!allowedCategories.includes(data.category)) {
      return { success: false, error: 'Invalid category' };
    }

    // Validate alt_text (optional, but if provided, must be valid)
    if (data.alt_text && typeof data.alt_text === 'string') {
      const sanitizedAltText = sanitizeInput.text(data.alt_text);
      if (sanitizedAltText.length > 1000) {
        return { success: false, error: 'Alt text must be less than 1000 characters' };
      }
      data.alt_text = sanitizedAltText;
    } else {
      data.alt_text = '';
    }

    // Validate title (optional, but if provided, must be valid)
    if (data.title && typeof data.title === 'string') {
      const sanitizedTitle = sanitizeInput.text(data.title);
      if (sanitizedTitle.length > 200) {
        return { success: false, error: 'Title must be less than 200 characters' };
      }
      data.title = sanitizedTitle;
    } else {
      data.title = '';
    }

    // Validate description (optional, but if provided, must be valid)
    if (data.description && typeof data.description === 'string') {
      const sanitizedDescription = sanitizeInput.text(data.description);
      if (sanitizedDescription.length > 5000) {
        return { success: false, error: 'Description must be less than 5000 characters' };
      }
      data.description = sanitizedDescription;
    } else {
      data.description = '';
    }

    // Validate tags (optional, but if provided, must be valid)
    if (data.tags && typeof data.tags === 'string') {
      const sanitizedTags = sanitizeInput.text(data.tags);
      if (sanitizedTags.length > 1000) {
        return { success: false, error: 'Tags must be less than 1000 characters' };
      }
      data.tags = sanitizedTags;
    } else {
      data.tags = '';
    }

    // Validate is_featured (must be boolean)
    if (typeof data.is_featured !== 'boolean') {
      return { success: false, error: 'is_featured must be a boolean' };
    }

    return { success: true, data };
  }
};

// Rate limiting utilities
export const rateLimiter = {
  // In-memory store for rate limiting (use Redis in production)
  attempts: new Map(),
  
  // Check if IP is rate limited
  isRateLimited: (ip, maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
    const now = Date.now();
    const key = `rate_limit_${ip}`;
    
    if (!rateLimiter.attempts.has(key)) {
      rateLimiter.attempts.set(key, { count: 1, resetTime: now + windowMs });
      return false;
    }
    
    const record = rateLimiter.attempts.get(key);
    
    if (now > record.resetTime) {
      // Reset the window
      rateLimiter.attempts.set(key, { count: 1, resetTime: now + windowMs });
      return false;
    }
    
    if (record.count >= maxAttempts) {
      return true; // Rate limited
    }
    
    record.count++;
    return false;
  },
  
  // Clean up old entries
  cleanup: () => {
    const now = Date.now();
    for (const [key, record] of rateLimiter.attempts.entries()) {
      if (now > record.resetTime) {
        rateLimiter.attempts.delete(key);
      }
    }
  }
};

// CSRF token utilities
export const csrfUtils = {
  // Generate CSRF token
  generateToken: () => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  },
  
  // Validate CSRF token
  validateToken: (token, sessionToken) => {
    if (!token || !sessionToken) return false;
    return token === sessionToken;
  }
};

// Honeypot utilities
export const honeypotUtils = {
  // Generate honeypot field name
  generateFieldName: () => {
    const names = ['website', 'url', 'homepage', 'link', 'address'];
    return names[Math.floor(Math.random() * names.length)];
  },
  
  // Check if honeypot was filled
  isHoneypotFilled: (honeypotValue) => {
    return honeypotValue && honeypotValue.trim().length > 0;
  }
};

// Security headers
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
};