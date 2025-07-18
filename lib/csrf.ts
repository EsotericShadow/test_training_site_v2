// lib/csrf.js
import crypto from 'crypto';
import { sql } from '@vercel/postgres';
import { validateSession } from './session-manager';
import { NextRequest } from 'next/server';

interface CsrfToken {
  id: number;
  token: string;
  created_at: string;
}

// Generate a CSRF token for a session
export async function generateToken(sessionId: number): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  await sql`
    INSERT INTO csrf_tokens (session_id, token)
    VALUES (${sessionId}, ${token})
  `;
  return token;
}

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

// Create a new CSRF token API route
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