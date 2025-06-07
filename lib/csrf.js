// lib/csrf.js
import crypto from 'crypto';

// Store CSRF tokens in memory (in production, you might want to use Redis)
const tokenStore = new Map();

// Generate a CSRF token for a session
export function generateToken(sessionId) {
  // Create a random token
  const token = crypto.randomBytes(32).toString('hex');
  
  // Store the token with the session ID
  tokenStore.set(sessionId, {
    token,
    createdAt: Date.now()
  });
  
  return token;
}

// Validate a CSRF token for a session
export function validateToken(sessionId, token) {
  // Get the stored token for this session
  const storedData = tokenStore.get(sessionId);
  
  // If no token exists or it doesn't match, validation fails
  if (!storedData || storedData.token !== token) {
    return false;
  }
  
  // Check if token is expired (tokens valid for 1 hour)
  const now = Date.now();
  const tokenAge = now - storedData.createdAt;
  if (tokenAge > 3600000) { // 1 hour in milliseconds
    // Remove expired token
    tokenStore.delete(sessionId);
    return false;
  }
  
  return true;
}

// Create a new CSRF token API route
export async function handleCsrfTokenRequest(request) {
  // Extract session ID from cookie
  const token = request.cookies.get('admin_token')?.value;
  
  if (!token) {
    return {
      status: 401,
      body: { error: 'Not authenticated' }
    };
  }
  
  // Use the JWT token as the session ID
  const sessionId = token;
  
  // Generate a new CSRF token
  const csrfToken = generateToken(sessionId);
  
  return {
    status: 200,
    body: { csrfToken }
  };
}
