// src/app/api/contact/security-init/route.ts
import { NextResponse, NextRequest } from 'next/server';

export const runtime = 'nodejs';
import { sql } from '@vercel/postgres';
import { generateToken } from '../../../../../lib/csrf';
import { logger } from '../../../../../lib/logger';

export async function GET(_request: NextRequest) {
  try {
    // Create a temporary public session with a 1-hour expiry
    const expires_at = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    const sessionResult = await sql`
      INSERT INTO public_sessions (expires_at)
      VALUES (${expires_at.toISOString()})
      RETURNING id;
    `;

    const session = sessionResult.rows[0];
    if (!session || !session.id) {
      throw new Error('Failed to create a public session in the database.');
    }

    const sessionId = session.id as number;

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