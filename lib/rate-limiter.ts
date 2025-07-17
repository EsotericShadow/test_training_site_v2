// lib/rate-limiter.ts
import { RateLimiter } from 'limiter';
import { NextRequest } from 'next/server';

// --- TYPE DEFINITIONS ---

interface RateLimitRule {
  tokensPerInterval: number;
  interval: number;
  description: string;
}

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

interface ExtendedRateLimiter extends RateLimiter {
  tokensPerInterval: number;
}

// --- CONFIGURATION ---

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

const limiters = new Map<string, RateLimiter>();

// --- FUNCTIONS ---

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

export function cleanupRateLimiters(): void {
  for (const [key, limiter] of limiters.entries()) {
    if (limiter.getTokensRemaining() === (limiter as ExtendedRateLimiter).tokensPerInterval) {
      limiters.delete(key);
    }
  }
}

export function getRateLimitRules(): { [key: string]: RateLimitRule } {
  return { ...rateLimitRules };
}

export function updateRateLimitRule(action: string, rule: Partial<RateLimitRule>): void {
  const currentRule = rateLimitRules[action] ?? rateLimitRules.default!;
  rateLimitRules[action] = {
    ...currentRule,
    ...rule,
  } as RateLimitRule;
}

if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimiters, 60 * 60 * 1000);
}