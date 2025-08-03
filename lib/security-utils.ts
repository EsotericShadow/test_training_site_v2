/*
 * Evergreen Web Solutions
 * Written and developed by Gabriel Lacroix
 *
 * File: security-utils.ts
 * Description: To be filled in with the script's purpose
 * Dependencies: To be filled in with key dependencies or modules
 * Created: August 2, 2025
 * Last Modified: August 2, 2025
 * Version: 1.0.0
 */

// lib/security-utils.ts
import DOMPurify from 'isomorphic-dompurify';
import validator from 'validator';

// --- TYPE DEFINITIONS ---

type ValidationResult<T> = 
  | { isValid: true; value: T }
  | { isValid: false; error: string };

type SuccessValidationResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string };

// --- INPUT SANITIZATION ---

export const sanitizeInput = {
  text: (input: unknown): string => {
    if (!input || typeof input !== 'string') return '';
    let sanitized = DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
    sanitized = sanitized.replace(/[<>"'%();&+]/g, '');
    return sanitized.trim().substring(0, 1000);
  },

  email: (input: unknown): string => {
    if (!input || typeof input !== 'string') return '';
    let sanitized = input.toLowerCase().trim();
    sanitized = sanitized.replace(/[^a-z0-9@._-]/g, '');
    return sanitized.substring(0, 254);
  },

  phone: (input: unknown): string => {
    if (!input || typeof input !== 'string') return '';
    const sanitized = input.replace(/[^0-9\s\-()+\.]/g, '');
    return sanitized.trim().substring(0, 20);
  },

  company: (input: unknown): string => {
    if (!input || typeof input !== 'string') return '';
    const sanitized = input.replace(/[^a-zA-Z0-9\s.,&'-]/g, '');
    return sanitized.trim().substring(0, 200);
  },

  message: (input: unknown): string => {
    if (!input || typeof input !== 'string') return '';
    let sanitized = DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script> )<[^<]*)*<\/script>/gi, '');
    sanitized = sanitized.replace(/javascript:/gi, '');
    sanitized = sanitized.replace(/on\w+\s*=/gi, '');
    return sanitized.trim().substring(0, 5000);
  },
};

// --- INPUT VALIDATION ---

export const validateInput = {
  name: (name: unknown): ValidationResult<string> => {
    if (!name || typeof name !== 'string') return { isValid: false, error: 'Name is required' };
    const sanitized = sanitizeInput.text(name);
    if (sanitized.length < 2) return { isValid: false, error: 'Name must be at least 2 characters' };
    if (sanitized.length > 100) return { isValid: false, error: 'Name must be less than 100 characters' };
    if (!/^[a-zA-Z\s\-\'\.]+$/.test(sanitized)) return { isValid: false, error: 'Name contains invalid characters' };
    return { isValid: true, value: sanitized };
  },

  email: (email: unknown): ValidationResult<string> => {
    if (!email || typeof email !== 'string') return { isValid: false, error: 'Email is required' };
    const sanitized = sanitizeInput.email(email);
    if (!validator.isEmail(sanitized)) return { isValid: false, error: 'Please enter a valid email address' };
    if (sanitized.includes('..')) return { isValid: false, error: 'Invalid email format' };
    return { isValid: true, value: sanitized };
  },

  phone: (phone: unknown): ValidationResult<string> => {
    if (!phone) return { isValid: true, value: '' };
    if (typeof phone !== 'string') return { isValid: false, error: 'Invalid phone format' };
    const sanitized = sanitizeInput.phone(phone);
    const digitsOnly = sanitized.replace(/\D/g, '');
    if (digitsOnly.length < 10 || digitsOnly.length > 15) return { isValid: false, error: 'Phone number must be 10-15 digits' };
    return { isValid: true, value: sanitized };
  },

  company: (company: unknown): ValidationResult<string> => {
    if (!company) return { isValid: true, value: '' };
    if (typeof company !== 'string') return { isValid: false, error: 'Invalid company format' };
    const sanitized = sanitizeInput.company(company);
    if (sanitized.length > 200) return { isValid: false, error: 'Company name must be less than 200 characters' };
    return { isValid: true, value: sanitized };
  },

  trainingType: (trainingType: unknown): ValidationResult<string> => {
    if (!trainingType) return { isValid: true, value: '' };
    if (typeof trainingType !== 'string') return { isValid: false, error: 'Invalid training type' };
    const validTypes = ['kist-orientation', 'whmis', 'fall-protection', 'confined-space', 'equipment-training', 'custom', 'consultation', 'other'];
    if (!validTypes.includes(trainingType)) return { isValid: false, error: 'Invalid training type selected' };
    return { isValid: true, value: trainingType };
  },

  message: (message: unknown): ValidationResult<string> => {
    if (!message || typeof message !== 'string') return { isValid: false, error: 'Message is required' };
    const sanitized = sanitizeInput.message(message);
    if (sanitized.length < 10) return { isValid: false, error: 'Message must be at least 10 characters' };
    if (sanitized.length > 5000) return { isValid: false, error: 'Message must be less than 5000 characters' };
    const spamPatterns = [
      /\b(viagra|cialis|casino|lottery|winner|congratulations)\b/i,
      /\b(click here|free money|make money fast)\b/i,
      /\b(urgent|act now|limited time)\b/i,
      /(http|https|www\.)/i,
      /\b\d{4}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{4}\b/,
    ];
    for (const pattern of spamPatterns) {
      if (pattern.test(sanitized)) return { isValid: false, error: 'Message contains prohibited content' };
    }
    return { isValid: true, value: sanitized };
  },

  fileMetadata: (data: Record<string, unknown>): SuccessValidationResult<Record<string, unknown>> => {
    if (typeof data !== 'object' || data === null) {
      return { success: false, error: 'Invalid input' };
    }
    if (!data['category'] || typeof data['category'] !== 'string') return { success: false, error: 'Category is required' };
    const allowedCategories = ['general', 'team-photos', 'course-images', 'testimonials', 'company', 'other'];
    if (!allowedCategories.includes(data['category'] as string)) return { success: false, error: 'Invalid category' };
    data['alt_text'] = sanitizeInput.text(data['alt_text'] || '').substring(0, 1000);
    data['title'] = sanitizeInput.text(data['title'] || '').substring(0, 200);
    data['description'] = sanitizeInput.text(data['description'] || '').substring(0, 5000);
    data['tags'] = sanitizeInput.text(data['tags'] || '').substring(0, 1000);
    if (typeof data['is_featured'] !== 'boolean') return { success: false, error: 'is_featured must be a boolean' };
    return { success: true, data };
  },

  teamMember: (data: Record<string, unknown>): SuccessValidationResult<Record<string, unknown>> => {
    if (typeof data !== 'object' || data === null) {
      return { success: false, error: 'Invalid input' };
    }
    const nameValidation = validateInput.name(data['name']);
    if (!nameValidation.isValid) return { success: false, error: nameValidation.error };
    data['name'] = nameValidation.value;

    if (!data['role'] || typeof data['role'] !== 'string') return { success: false, error: 'Role is required' };
    data['role'] = sanitizeInput.text(data['role']).substring(0, 100);

    data['bio'] = sanitizeInput.message(data['bio'] || '').substring(0, 5000);

    if (data['photo_url'] && typeof data['photo_url'] === 'string') {
      const sanitizedUrl = sanitizeInput.text(data['photo_url']);
      if (!validator.isURL(sanitizedUrl, { require_protocol: true })) return { success: false, error: 'Invalid photo URL' };
      data['photo_url'] = sanitizedUrl;
    } else {
      data['photo_url'] = '';
    }

    if (data['experience_years'] != null) {
      const parsedYears = parseInt(data['experience_years'] as string, 10);
      if (isNaN(parsedYears) || parsedYears < 0 || parsedYears > 100) return { success: false, error: 'Experience years must be a number between 0 and 100' };
      data['experience_years'] = parsedYears;
    } else {
      data['experience_years'] = null;
    }

    if (data['specializations'] && Array.isArray(data['specializations'])) {
      data['specializations'] = (data['specializations'] as unknown[]).map((spec: unknown) => (typeof spec === 'string' ? sanitizeInput.text(spec).substring(0, 100) : '')).filter((spec: string) => spec.length > 0);
    } else {
      data['specializations'] = [];
    }

    if (typeof data['featured'] !== 'boolean') return { success: false, error: 'Featured must be a boolean' };

    if (data['display_order'] != null) {
      const parsedOrder = parseInt(data['display_order'] as string, 10);
      if (isNaN(parsedOrder) || parsedOrder < 0) return { success: false, error: 'Display order must be a non-negative number' };
      data['display_order'] = parsedOrder;
    } else {
      data['display_order'] = 0;
    }

    return { success: true, data };
  },

  course: (data: Record<string, unknown>): SuccessValidationResult<Record<string, unknown>> => {
    if (typeof data !== 'object' || data === null) {
      return { success: false, error: 'Invalid input' };
    }
    if (!data['title'] || typeof data['title'] !== 'string') return { success: false, error: 'Title is required' };
    data['title'] = sanitizeInput.text(data['title']).substring(0, 200);

    if (!data['slug'] || typeof data['slug'] !== 'string') return { success: false, error: 'Slug is required' };
    data['slug'] = sanitizeInput.text(data['slug']).substring(0, 100);

    if (!data['description'] || typeof data['description'] !== 'string') return { success: false, error: 'Description is required' };
    data['description'] = sanitizeInput.message(data['description']).substring(0, 5000);

    if (!data['duration'] || typeof data['duration'] !== 'string') return { success: false, error: 'Duration is required' };
    data['duration'] = sanitizeInput.text(data['duration']).substring(0, 100);

    if (!data['audience'] || typeof data['audience'] !== 'string') return { success: false, error: 'Audience is required' };
    data['audience'] = sanitizeInput.text(data['audience']).substring(0, 100);

    if (data['image_url'] && typeof data['image_url'] === 'string') {
        const sanitizedUrl = sanitizeInput.text(data['image_url']);
        if (!validator.isURL(sanitizedUrl, { require_protocol: true })) return { success: false, error: 'Invalid image URL' };
        data['image_url'] = sanitizedUrl;
    } else {
        data['image_url'] = '';
    }

    data['image_alt'] = sanitizeInput.text(data['image_alt'] || '').substring(0, 1000);

    if (data['category_id'] != null) {
      const parsedCatId = parseInt(data['category_id'] as string, 10);
      if (isNaN(parsedCatId) || parsedCatId < 0) return { success: false, error: 'Category ID must be a non-negative number' };
      data['category_id'] = parsedCatId;
    } else {
      data['category_id'] = null;
    }

    if (typeof data['popular'] !== 'boolean') return { success: false, error: 'Popular must be a boolean' };

    return { success: true, data };
  },

  companyInfo: (data: Record<string, unknown>): SuccessValidationResult<Record<string, unknown>> => {
    if (typeof data !== 'object' || data === null) {
      return { success: false, error: 'Invalid input' };
    }
    // A basic example, expand as needed
    if (!data['company_name'] || typeof data['company_name'] !== 'string' || (data['company_name'] as string).length < 2) {
      return { success: false, error: 'Company name must be at least 2 characters' };
    }
    return { success: true, data };
  },

  companyValue: (data: Record<string, unknown>): SuccessValidationResult<Record<string, unknown>> => {
    if (typeof data !== 'object' || data === null) {
      return { success: false, error: 'Invalid input' };
    }
    if (!data['title'] || typeof data['title'] !== 'string' || (data['title'] as string).length < 2) {
      return { success: false, error: 'Value title must be at least 2 characters' };
    }
    if (!data['description'] || typeof data['description'] !== 'string' || (data['description'] as string).length < 10) {
      return { success: false, error: 'Value description must be at least 10 characters' };
    }
    return { success: true, data };
  },

  whyChooseUs: (data: Record<string, unknown>): SuccessValidationResult<Record<string, unknown>> => {
    if (typeof data !== 'object' || data === null) {
      return { success: false, error: 'Invalid input' };
    }
    if (!data['point'] || typeof data['point'] !== 'string' || (data['point'] as string).length < 10) {
      return { success: false, error: 'Point must be at least 10 characters' };
    }
    return { success: true, data };
  },

  footerBottomBadge: (data: Record<string, unknown>): SuccessValidationResult<Record<string, unknown>> => {
    if (typeof data !== 'object' || data === null) {
      return { success: false, error: 'Invalid input' };
    }
    if (!data['title'] || typeof data['title'] !== 'string' || (data['title'] as string).length < 2) {
      return { success: false, error: 'Badge title must be at least 2 characters' };
    }
    return { success: true, data };
  },

  footerCertification: (data: Record<string, unknown>): SuccessValidationResult<Record<string, unknown>> => {
    if (typeof data !== 'object' || data === null) {
      return { success: false, error: 'Invalid input' };
    }
    if (!data['title'] || typeof data['title'] !== 'string' || (data['title'] as string).length < 2) {
      return { success: false, error: 'Certification title must be at least 2 characters' };
    }
    return { success: true, data };
  },

  footerQuickLink: (data: Record<string, unknown>): SuccessValidationResult<Record<string, unknown>> => {
    if (typeof data !== 'object' || data === null) {
      return { success: false, error: 'Invalid input' };
    }
    if (!data['title'] || typeof data['title'] !== 'string' || (data['title'] as string).length < 2) {
      return { success: false, error: 'Link title must be at least 2 characters' };
    }
    const url = data['url'] as string;
    if (!url) {
      return { success: false, error: 'URL is required' };
    }
    // Allow relative paths or valid absolute URLs
    if (!url.startsWith('/') && !url.startsWith('#') && !validator.isURL(url, { require_protocol: true })) {
      return { success: false, error: 'Invalid link URL. Must be a full URL (e.g., https://example.com) or a relative path (e.g., /about).' };
    }
    data['url'] = DOMPurify.sanitize(url);
    return { success: true, data };
  },

  footerStat: (data: Record<string, unknown>): SuccessValidationResult<Record<string, unknown>> => {
    if (typeof data !== 'object' || data === null) {
      return { success: false, error: 'Invalid input' };
    }
    if (!data['number_text'] || typeof data['number_text'] !== 'string' || (data['number_text'] as string).length < 1) {
      return { success: false, error: 'Stat number text must be at least 1 character' };
    }
    if (!data['label'] || typeof data['label'] !== 'string' || (data['label'] as string).length < 2) {
      return { success: false, error: 'Stat label must be at least 2 characters' };
    }
    return { success: true, data };
  },

  footerContent: (data: Record<string, unknown>): SuccessValidationResult<Record<string, unknown>> => {
    if (typeof data !== 'object' || data === null) {
      return { success: false, error: 'Invalid input' };
    }
    if (!data['company_name'] || typeof data['company_name'] !== 'string' || (data['company_name'] as string).length < 2) {
      return { success: false, error: 'Company name must be at least 2 characters' };
    }
    return { success: true, data };
  },
};

// --- RATE LIMITING ---

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

export const rateLimiter = {
  attempts: new Map<string, RateLimitRecord>(),

  isRateLimited: (ip: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean => {
    const now = Date.now();
    const key = `rate_limit_${ip}`;
    const record = rateLimiter.attempts.get(key);

    if (!record || now > record.resetTime) {
      rateLimiter.attempts.set(key, { count: 1, resetTime: now + windowMs });
      return false;
    }

    if (record.count >= maxAttempts) {
      return true;
    }

    record.count++;
    return false;
  },

  cleanup: (): void => {
    const now = Date.now();
    for (const [key, record] of Array.from(rateLimiter.attempts.entries())) {
      if (now > record.resetTime) {
        rateLimiter.attempts.delete(key);
      }
    }
  },
};

// --- HONEYPOT ---

export const honeypotUtils = {
  generateFieldName: (): string => {
    const names = ['website', 'url', 'homepage', 'link', 'address'];
    if (names.length === 0) return 'website'; // Fallback
    return names[Math.floor(Math.random() * names.length)] || 'website';
  },

  isHoneypotFilled: (honeypotValue: unknown): boolean => {
    return !!honeypotValue && typeof honeypotValue === 'string' && honeypotValue.trim().length > 0;
  },
};

// --- SECURITY HEADERS ---

export const securityHeaders: { [key: string]: string } = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self';",
};


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
//                           \/                                       \/     \/                 