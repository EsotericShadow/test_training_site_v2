/*
 * Evergreen Web Solutions
 * Written and developed by Gabriel Lacroix
 *
 * File: rate-limiter.ts
 * Description: This script provides a flexible and robust rate-limiting mechanism for the application.
 * It is designed to be used as a middleware to protect API routes from abuse.
 *
 * Dependencies:
 * - limiter: The underlying library used for rate-limiting.
 * - next/server: Provides Next.js-specific server-side utilities.
 *
 * Created: 2025-07-17
 * Last Modified: 2025-07-17
 * Version: 1.0.1
 */

import { RateLimiter } from 'limiter';
import { NextRequest } from 'next/server';

// --- TYPE DEFINITIONS ---

/**
 * @interface RateLimitRule
 * @description Defines the shape of a rate-limiting rule.
 */
interface RateLimitRule {
  tokensPerInterval: number;
  interval: number;
  description: string;
}

/**
 * @interface RateLimitResult
 * @description Defines the shape of the result returned by the rate-limiting functions.
 */
export interface RateLimitResult {
  limited: boolean;
  remaining: number;
  resetTime: Date;
  action: string;
  limit: number;
  description: string;
  error?: string;
  progressive?: boolean;
  failedAttempts?: number;
}

/**
 * @interface ExtendedRateLimiter
 * @description Extends the `RateLimiter` interface to include the `tokensPerInterval` property.
 */
interface ExtendedRateLimiter extends RateLimiter {
  tokensPerInterval: number;
}

// --- CONFIGURATION ---

/**
 * @constant rateLimitRules
 * @description A collection of rate-limiting rules for different actions.
 */
const rateLimitRules: { [key: string]: RateLimitRule } = {
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
 * @constant limiters
 * @description A map of rate limiters for different IP addresses and actions.
 */
const limiters = new Map<string, RateLimiter>();

// --- FUNCTIONS ---

/**
 * @function getRateLimiter
 * @description Gets or creates a rate limiter for a given IP address and action.
 * @param {string} ip - The IP address to get the rate limiter for.
 * @param {string} [action='default'] - The action to get the rate limiter for.
 * @returns {RateLimiter} The rate limiter for the given IP address and action.
 */
export function getRateLimiter(ip: string, action: string = 'default'): RateLimiter {
  const key = `${ip}:${action}`;
  
  if (!limiters.has(key)) {
    const rule = rateLimitRules[action] ?? rateLimitRules.default!;
    limiters.set(key, new RateLimiter({
      tokensPerInterval: rule.tokensPerInterval,
      interval: rule.interval
    }));
  }
  
  return limiters.get(key)!;
}

/**
 * @function applyRateLimit
 * @description Applies a rate limit to a request.
 * @param {NextRequest} _req - The incoming Next.js request.
 * @param {string} ip - The IP address to apply the rate limit to.
 * @param {string} [action='default'] - The action to apply the rate limit to.
 * @returns {Promise<RateLimitResult>} The result of the rate-limiting operation.
 */
export async function applyRateLimit(_req: NextRequest, ip: string, action: string = 'default'): Promise<RateLimitResult> {
  const limiter = getRateLimiter(ip, action);
  const rule = rateLimitRules[action] ?? rateLimitRules.default!;
  
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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Rate limiting error:', message);
    return {
      limited: false,
      remaining: rule.tokensPerInterval,
      resetTime: new Date(Date.now() + rule.interval),
      action,
      limit: rule.tokensPerInterval,
      description: rule.description,
      error: message
    };
  }
}

/**
 * @function applyProgressiveRateLimit
 * @description Applies a progressive rate limit to a request.
 * This is useful for actions like login, where you want to be more strict after a few failed attempts.
 * @param {NextRequest} req - The incoming Next.js request.
 * @param {string} ip - The IP address to apply the rate limit to.
 * @param {number} [failedAttempts=0] - The number of failed attempts for the given IP address.
 * @param {string} [action='login'] - The action to apply the rate limit to.
 * @returns {Promise<RateLimitResult>} The result of the rate-limiting operation.
 */
export async function applyProgressiveRateLimit(req: NextRequest, ip: string, failedAttempts: number = 0, action: string = 'login'): Promise<RateLimitResult> {
  const baseRule = rateLimitRules[action] ?? rateLimitRules.default!;
  const adjustedRule = { ...baseRule };
  
  if (failedAttempts >= 3) {
    adjustedRule.tokensPerInterval = Math.max(1, Math.floor(baseRule.tokensPerInterval / 4));
    adjustedRule.interval = baseRule.interval * 2;
  } else if (failedAttempts >= 1) {
    adjustedRule.tokensPerInterval = Math.max(2, Math.floor(baseRule.tokensPerInterval / 2));
  }
  
  const key = `${ip}:${action}:progressive`;
  
  if (!limiters.has(key)) {
    limiters.set(key, new RateLimiter({
      tokensPerInterval: adjustedRule.tokensPerInterval,
      interval: adjustedRule.interval
    }));
  }
  
  const limiter = limiters.get(key)!;
  
  try {
    const hasToken = await limiter.tryRemoveTokens(1);
    
    if (!hasToken) {
      return {
        limited: true,
        remaining: 0,
        resetTime: new Date(Date.now() + adjustedRule.interval),
        action,
        limit: adjustedRule.tokensPerInterval,
        description: `Progressive ${baseRule.description}`,
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
      description: `Progressive ${baseRule.description}`,
      progressive: true,
      failedAttempts
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Progressive rate limiting error:', message);
    return await applyRateLimit(req, ip, action);
  }
}

/**
 * @function getRateLimitStatus
 * @description Gets the status of a rate limiter for a given IP address and action.
 * @param {string} ip - The IP address to get the rate limit status for.
 * @param {string} [action='default'] - The action to get the rate limit status for.
 * @returns {Omit<RateLimitResult, 'limited' | 'error'>} The status of the rate limiter.
 */
export function getRateLimitStatus(ip: string, action: string = 'default'): Omit<RateLimitResult, 'limited' | 'error'> {
  const limiter = getRateLimiter(ip, action);
  const rule = rateLimitRules[action] ?? rateLimitRules.default!;
  
  return {
    remaining: limiter.getTokensRemaining(),
    limit: rule.tokensPerInterval,
    resetTime: new Date(Date.now() + rule.interval),
    action,
    description: rule.description
  };
}

/**
 * @function resetRateLimit
 * @description Resets the rate limit for a given IP address and action.
 * @param {string} ip - The IP address to reset the rate limit for.
 * @param {string} [action='default'] - The action to reset the rate limit for.
 */
export function resetRateLimit(ip: string, action: string = 'default'): void {
  const key = `${ip}:${action}`;
  if (limiters.has(key)) {
    limiters.delete(key);
  }
  
  const progressiveKey = `${ip}:${action}:progressive`;
  if (limiters.has(progressiveKey)) {
    limiters.delete(progressiveKey);
  }
}

/**
 * @function cleanupRateLimiters
 * @description Cleans up expired rate limiters.
 * This function is run periodically to prevent memory leaks.
 */
export function cleanupRateLimiters(): void {
  for (const [key, limiter] of limiters.entries()) {
    if (limiter.getTokensRemaining() === (limiter as ExtendedRateLimiter).tokensPerInterval) {
      limiters.delete(key);
    }
  }
}

/**
 * @function getRateLimitRules
 * @description Gets the current rate-limiting rules.
 * @returns {{ [key: string]: RateLimitRule }} The current rate-limiting rules.
 */
export function getRateLimitRules(): { [key: string]: RateLimitRule } {
  return { ...rateLimitRules };
}

/**
 * @function updateRateLimitRule
 * @description Updates a rate-limiting rule.
 * @param {string} action - The action to update the rule for.
 * @param {Partial<RateLimitRule>} rule - The new rule.
 */
export function updateRateLimitRule(action: string, rule: Partial<RateLimitRule>): void {
  const currentRule = rateLimitRules[action] ?? rateLimitRules.default!;
  rateLimitRules[action] = {
    ...currentRule,
    ...rule,
  } as RateLimitRule;
}

// Cleanup interval setup
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimiters, 60 * 60 * 1000);
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
//                           \/                                       \/     \/                 