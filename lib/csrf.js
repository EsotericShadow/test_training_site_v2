// lib/csrf.js
import crypto from 'crypto';

// Store CSRF tokens in memory (in production, you might want to use Redis)
const tokenStore = new Map();

// Generate a CSRF token for a session
export function generateToken(sessionId) {
  const token = crypto.randomBytes(32).toString('hex');
  tokenStore.set(sessionId, {
    token,
    createdAt: Date.now()
  });
  console.log(`[CSRF] Generated token for sessionId: ${sessionId}, token: ${token}`);
  return token;
}

export function validateToken(sessionId, token) {
  const storedData = tokenStore.get(sessionId);
  console.log(`[CSRF] Validating token for sessionId: ${sessionId}, received token: ${token}, stored data: ${JSON.stringify(storedData)}`);
  if (!storedData || storedData.token !== token) {
    console.log(`[CSRF] Validation failed: storedData missing or token mismatch`);
    return false;
  }
  const now = Date.now();
  const tokenAge = now - storedData.createdAt;
  if (tokenAge > 3600000) {
    console.log(`[CSRF] Validation failed: token expired for sessionId: ${sessionId}`);
    tokenStore.delete(sessionId);
    return false;
  }
  console.log(`[CSRF] Validation successful for sessionId: ${sessionId}`);
  return true;
}

// Create a new CSRF token API route
import { validateSession } from './session-manager';

export async function handleCsrfTokenRequest(request) {
  const token = request.cookies.get('admin_token')?.value;

  if (!token) {
    return {
      status: 401,
      body: { error: 'Not authenticated' }
    };
  }

  const sessionResult = await validateSession(token, request);

  if (!sessionResult.valid) {
    return {
      status: 401,
      body: { error: sessionResult.reason || 'Invalid session' }
    };
  }

  // Use the database session ID for CSRF token generation
  const sessionId = sessionResult.session.id;
  const csrfToken = generateToken(sessionId);

  return {
    status: 200,
    body: { csrfToken }
  };
}
