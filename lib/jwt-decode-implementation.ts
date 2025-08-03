/*
 * JWT Decoding Implementation
 * Written and developed by Gabriel Lacroix for Evergreen Web Solutions
 *
 * File: jwt-decode-implementation.ts
 * Description: Implementation of JWT decoding to extract user ID from admin_token cookie
 * Dependencies: secure-jwt.ts, Next.js server utilities
 * Created: August 3, 2025
 * Version: 1.0.0
 */

import { NextRequest } from 'next/server';
import { verifySecureToken } from './secure-jwt';

/**
 * Extract user ID from JWT token in admin_token cookie
 * 
 * @param request - The Next.js request object containing cookies
 * @returns Promise<string | number> - The user ID or 'anonymous' if not found/invalid
 */
export async function extractUserIdFromToken(request: NextRequest): Promise<string | number> {
  // Extract user ID if available
  let userId: string | number = 'anonymous';
  
  try {
    const token = request.cookies.get('admin_token')?.value;
    if (token) {
      // Use the secure JWT verification function to decode the token
      const verificationResult = await verifySecureToken(token, request);
      
      if (verificationResult.valid && verificationResult.decoded) {
        // Extract user ID from the decoded token
        // The token contains both 'id' and 'userId' fields based on the TokenUser interface
        userId = verificationResult.decoded.userId || verificationResult.decoded.id;
      } else {
        // Token is invalid or expired
        console.warn('Invalid or expired admin token:', verificationResult.reason);
        userId = 'invalid_token';
      }
    }
  } catch (e) {
    // Ignore token extraction errors and use the default userId
    console.error('Error extracting user ID:', e);
    userId = 'anonymous';
  }
  
  return userId;
}

/**
 * Alternative implementation using direct JWT decoding (less secure)
 * This is provided for reference but the secure method above is recommended
 */
export function extractUserIdSimple(request: NextRequest): string | number {
  let userId: string | number = 'anonymous';
  
  try {
    const token = request.cookies.get('admin_token')?.value;
    if (token) {
      // Simple base64 decode of JWT payload (NOT RECOMMENDED for production)
      // This doesn't verify the signature or check expiration
      const parts = token.split('.');
      if (parts.length === 3 && typeof parts[1] === 'string') {
        const payload = JSON.parse(atob(parts[1]));
        userId = payload.userId || payload.sub || payload.id || 'authenticated_user';
      }
    }
  } catch (e) {
    console.error('Error extracting user ID:', e);
    userId = 'anonymous';
  }
  
  return userId;
}

/**
 * Usage example in an API route:
 * 
 * import { NextRequest, NextResponse } from 'next/server';
 * import { extractUserIdFromToken } from './jwt-decode-implementation';
 * 
 * export async function POST(request: NextRequest) {
 *   // Extract user ID using secure JWT verification
 *   const userId = await extractUserIdFromToken(request);
 *   
 *   // Use the userId in your logic
 *   console.log('Request from user:', userId);
 *   
 *   // Continue with your API logic...
 *   return NextResponse.json({ success: true, userId });
 * }
 */

/**
 * Inline implementation that can be directly used in your existing code:
 */
export const inlineJWTDecoding = `
// Extract user ID if available
let userId: string | number = 'anonymous';
try {
  const token = request.cookies.get('admin_token')?.value;
  if (token) {
    // Import the secure JWT verification function
    const { verifySecureToken } = await import('./secure-jwt');
    
    // Verify and decode the token securely
    const verificationResult = await verifySecureToken(token, request);
    
    if (verificationResult.valid && verificationResult.decoded) {
      // Extract user ID from the decoded token
      userId = verificationResult.decoded.userId || verificationResult.decoded.id || 'authenticated_user';
    } else {
      // Token is invalid or expired
      console.warn('Invalid or expired admin token:', verificationResult.reason);
      userId = 'invalid_token';
    }
  }
} catch (e) {
  // Ignore token extraction errors and use the default userId
  console.error('Error extracting user ID:', e);
}
`;