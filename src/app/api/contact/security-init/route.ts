// src/app/api/contact/security-init/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { db } from '../../../../../lib/database';
import { generateToken } from '../../../../../lib/csrf';
import { logger } from '../../../../../lib/logger';
import type { ResultSetHeader } from 'mysql2';

export async function GET(_request: NextRequest) {
  try {
    // Create a temporary public session with a 1-hour expiry
    const expires_at = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    const [result] = await db.query<ResultSetHeader>(
      `
      INSERT INTO public_sessions (expires_at)
      VALUES (?)
    `,
      [expires_at.toISOString().slice(0, 19).replace('T', ' ')]
    );

    const sessionId = result.insertId;

    if (!sessionId) {
      throw new Error('Failed to create a public session.');
    }

    // Generate a CSRF token tied to this new session ID
    const csrfToken = await generateToken(sessionId);

    return NextResponse.json({
      success: true,
      sessionId: sessionId,
      csrfToken: csrfToken,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    logger.error('Failed to initialize security for contact form', {
      error: message,
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to initialize security context. Please try refreshing the page.',
      },
      { status: 500 }
    );
  }
}