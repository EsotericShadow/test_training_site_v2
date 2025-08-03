/*
 * Evergreen Web Solutions
 * Written and developed by Gabriel Lacroix
 *
 * File: csrf.ts
 * Description: This script implements CSRF (Cross-Site Request Forgery) protection for the application.
 * It provides functions for generating and validating CSRF tokens, which are used to ensure that
 * sensitive actions are only performed by the authenticated user.
 *
 * Dependencies:
 * - crypto: Used for generating cryptographically secure random tokens.
 * - @vercel/postgres: Used for all database interactions.
 * - ./session-manager: Used to validate the user's session before generating a CSRF token.
 * - next/server: Provides Next.js-specific server-side utilities.
 *
 * Created: 2025-07-17
 * Last Modified: 2025-07-18
 * Version: 1.0.1
 */

import crypto from 'crypto';
import { sql } from '@vercel/postgres';
import { validateSession } from './session-manager';
import { NextRequest } from 'next/server';

/**
 * @interface CsrfToken
 * @description Represents a CSRF token as it is stored in the database.
 */
interface CsrfToken {
  id: number;
  token: string;
  created_at: string;
}

/**
 * @function generateToken
 * @description Generates a new CSRF token and stores it in the database, associated with a session.
 * @param {number} sessionId - The ID of the session to associate the token with.
 * @returns {Promise<string>} The generated CSRF token.
 */
export async function generateToken(sessionId: number): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  await sql`
    INSERT INTO csrf_tokens (session_id, token)
    VALUES (${sessionId}, ${token})
  `;
  return token;
}

/**
 * @function validateToken
 * @description Validates a CSRF token against the one stored in the database for a given session.
 * To prevent timing attacks, this function uses `crypto.timingSafeEqual` for comparing tokens.
 * The token is for one-time use and is deleted after successful validation.
 * @param {number} sessionId - The ID of the session the token belongs to.
 * @param {string} token - The CSRF token to validate.
 * @returns {Promise<boolean>} Whether the token is valid.
 */
export async function validateToken(sessionId: number, token: string): Promise<boolean> {
  // 1. Fetch the most recent stored token data using the session ID.
  const result = await sql<CsrfToken>`
    SELECT id, token, created_at FROM csrf_tokens
    WHERE session_id = ${sessionId}
    ORDER BY created_at DESC
    LIMIT 1
  `;
  const storedData = result.rows[0];

  // 2. If there's no stored token for the session, or the user provided no token, fail.
  if (!storedData || !token) {
    return false;
  }

  // 3. Check for token expiration.
  const now = Date.now();
  const tokenAge = now - new Date(storedData.created_at).getTime();
  if (tokenAge > 3600000) { // 1 hour expiry
    // Clean up expired token
    await sql`
      DELETE FROM csrf_tokens
      WHERE session_id = ${sessionId}
    `;
    return false;
  }

  // 4. Perform a constant-time comparison to prevent timing attacks.
  try {
    const storedTokenBuffer = Buffer.from(storedData.token, 'hex');
    const userTokenBuffer = Buffer.from(token, 'hex');
    
    // Ensure buffers are the same length to prevent timingSafeEqual from throwing an error
    if (storedTokenBuffer.length !== userTokenBuffer.length) {
      return false;
    }

    const isValid = crypto.timingSafeEqual(storedTokenBuffer, userTokenBuffer);

    if (isValid) {
      // 5. For one-time use, delete the token after successful validation.
      await sql`
        DELETE FROM csrf_tokens
        WHERE id = ${storedData.id}
      `;
      return true;
    }
  } catch {
    // This can happen if the user-provided token is not a valid hex string,
    // causing Buffer.from() to fail. We can treat this as an invalid token.
    return false;
  }

  return false;
}

/**
 * @function handleCsrfTokenRequest
 * @description Handles a request for a new CSRF token.
 * This function is designed to be used in an API route to provide a CSRF token to the client.
 * @param {NextRequest} request - The incoming Next.js request.
 * @returns {Promise<{ status: number; body: { error: string; } | { csrfToken: string; } }>} The response to the client.
 */
export async function handleCsrfTokenRequest(request: NextRequest): Promise<{ status: number; body: { error: string; } | { csrfToken: string; } }> {
  const token = request.cookies.get('admin_token')?.value;

  if (!token) {
    return {
      status: 401,
      body: { error: 'Not authenticated' }
    };
  }

  const sessionResult = await validateSession(token, request);

  if (!sessionResult.valid || !sessionResult.session) {
    return {
      status: 401,
      body: { error: sessionResult.reason || 'Invalid session' }
    };
  }

  // Use the database session ID for CSRF token generation
  const sessionId = sessionResult.session.id;
  const csrfToken = await generateToken(sessionId);

  return {
    status: 200,
    body: { csrfToken }
  };
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