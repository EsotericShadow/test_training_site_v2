// lib/enhanced-rate-limiter.js
import { RateLimiter } from 'limiter';

// Store limiters in memory (in production, you might want to use Redis)
const limiters = new Map();

// Rate limiting rules for different endpoints/actions
const rateLimitRules = {
  'login': { 
    tokensPerInterval: 5, 
    interval: 60 * 60 * 1000, // 5 attempts per hour
    description: 'Login attempts'
  },
  'password_reset': { 
    tokensPerInterval: 3, 
    interval: 60 * 60 * 1000, // 3 attempts per hour
    description: 'Password reset requests'
  },
  'admin_api': { 
    tokensPerInterval: 100, 
    interval: 60 * 60 * 1000, // 100 requests per hour
    description: 'Admin API requests'
  },
  'public_api': { 
    tokensPerInterval: 60, 
    interval: 60 * 1000, // 60 requests per minute
    description: 'Public API requests'
  },
  'contact_form': { 
    tokensPerInterval: 5, 
    interval: 60 * 60 * 1000, // 5 submissions per hour
    description: 'Contact form submissions'
  },
  'default': { 
    tokensPerInterval: 30, 
    interval: 60 * 1000, // 30 requests per minute
    description: 'Default rate limit'
  }
};

/**
 * Get or create a rate limiter for a specific IP and action
 * @param {string} ip - The IP address
 * @param {string} action - The action being rate limited
 * @returns {RateLimiter} - The rate limiter instance
 */
export function getRateLimiter(ip, action = 'default') {
  const key = `${ip}:${action}`;
  
  if (!limiters.has(key)) {
    const rule = rateLimitRules[action] || rateLimitRules.default;
    limiters.set(key, new RateLimiter({
      tokensPerInterval: rule.tokensPerInterval,
      interval: rule.interval
    }));
  }
  
  return limiters.get(key);
}

/**
 * Apply rate limiting for a specific action
 * @param {Object} req - The request object
 * @param {string} ip - The IP address
 * @param {string} action - The action being rate limited
 * @returns {Object} - Rate limit result
 */
export async function applyRateLimit(req, ip, action = 'default') {
  const limiter = getRateLimiter(ip, action);
  const rule = rateLimitRules[action] || rateLimitRules.default;
  
  try {
    const hasToken = await limiter.tryRemoveTokens(1);
    
    if (!hasToken) {
      return {
        limited: true,
        remaining: 0,
        resetTime: new Date(Date.now() + rule.interval),
        action,
        limit: rule.tokensPerInterval,
        description: rule.description
      };
    }
    
    return {
      limited: false,
      remaining: limiter.getTokensRemaining(),
      resetTime: new Date(Date.now() + rule.interval),
      action,
      limit: rule.tokensPerInterval,
      description: rule.description
    };
  } catch (error) {
    console.error('Rate limiting error:', error);
    // In case of error, allow the request but log the issue
    return {
      limited: false,
      remaining: rule.tokensPerInterval,
      resetTime: new Date(Date.now() + rule.interval),
      action,
      limit: rule.tokensPerInterval,
      description: rule.description,
      error: error.message
    };
  }
}

/**
 * Apply progressive rate limiting based on failed attempts
 * @param {Object} req - The request object
 * @param {string} ip - The IP address
 * @param {number} failedAttempts - Number of recent failed attempts
 * @param {string} action - The action being rate limited
 * @returns {Object} - Rate limit result
 */
export async function applyProgressiveRateLimit(req, ip, failedAttempts = 0, action = 'login') {
  // Adjust rate limiting based on failed attempts
  let adjustedRule = { ...rateLimitRules[action] };
  
  if (failedAttempts >= 3) {
    // After 3 failed attempts, reduce allowed requests significantly
    adjustedRule.tokensPerInterval = Math.max(1, Math.floor(adjustedRule.tokensPerInterval / 4));
    adjustedRule.interval = adjustedRule.interval * 2; // Double the interval
  } else if (failedAttempts >= 1) {
    // After 1 failed attempt, reduce allowed requests moderately
    adjustedRule.tokensPerInterval = Math.max(2, Math.floor(adjustedRule.tokensPerInterval / 2));
  }
  
  const key = `${ip}:${action}:progressive`;
  
  if (!limiters.has(key)) {
    limiters.set(key, new RateLimiter({
      tokensPerInterval: adjustedRule.tokensPerInterval,
      interval: adjustedRule.interval
    }));
  }
  
  const limiter = limiters.get(key);
  
  try {
    const hasToken = await limiter.tryRemoveTokens(1);
    
    if (!hasToken) {
      return {
        limited: true,
        remaining: 0,
        resetTime: new Date(Date.now() + adjustedRule.interval),
        action,
        limit: adjustedRule.tokensPerInterval,
        description: `Progressive ${rateLimitRules[action].description}`,
        progressive: true,
        failedAttempts
      };
    }
    
    return {
      limited: false,
      remaining: limiter.getTokensRemaining(),
      resetTime: new Date(Date.now() + adjustedRule.interval),
      action,
      limit: adjustedRule.tokensPerInterval,
      description: `Progressive ${rateLimitRules[action].description}`,
      progressive: true,
      failedAttempts
    };
  } catch (error) {
    console.error('Progressive rate limiting error:', error);
    // Fallback to regular rate limiting
    return await applyRateLimit(req, ip, action);
  }
}

/**
 * Get rate limit status without consuming a token
 * @param {string} ip - The IP address
 * @param {string} action - The action being checked
 * @returns {Object} - Current rate limit status
 */
export function getRateLimitStatus(ip, action = 'default') {
  const limiter = getRateLimiter(ip, action);
  const rule = rateLimitRules[action] || rateLimitRules.default;
  
  return {
    remaining: limiter.getTokensRemaining(),
    limit: rule.tokensPerInterval,
    resetTime: new Date(Date.now() + rule.interval),
    action,
    description: rule.description
  };
}

/**
 * Reset rate limiter for a specific IP and action
 * @param {string} ip - The IP address
 * @param {string} action - The action to reset
 */
export function resetRateLimit(ip, action = 'default') {
  const key = `${ip}:${action}`;
  if (limiters.has(key)) {
    limiters.delete(key);
  }
  
  // Also reset progressive rate limiter if it exists
  const progressiveKey = `${ip}:${action}:progressive`;
  if (limiters.has(progressiveKey)) {
    limiters.delete(progressiveKey);
  }
}

/**
 * Clean up old rate limiters to prevent memory leaks
 */
export function cleanupRateLimiters() {
  // In a production environment with Redis, this would be handled automatically
  // For in-memory storage, we can implement a simple cleanup based on last access time
  
  for (const [key, limiter] of limiters.entries()) {
    // This is a simple heuristic - in practice, you'd want to track last access time
    if (limiter.getTokensRemaining() === limiter.tokensPerInterval) {
      // If the limiter is at full capacity, it hasn't been used recently
      limiters.delete(key);
    }
  }
}

/**
 * Get all rate limiting rules
 * @returns {Object} - All rate limiting rules
 */
export function getRateLimitRules() {
  return { ...rateLimitRules };
}

/**
 * Update rate limiting rules (useful for dynamic configuration)
 * @param {string} action - The action to update
 * @param {Object} rule - The new rule configuration
 */
export function updateRateLimitRule(action, rule) {
  rateLimitRules[action] = {
    ...rateLimitRules[action],
    ...rule
  };
}

// Set up periodic cleanup (every hour)
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimiters, 60 * 60 * 1000);
}

