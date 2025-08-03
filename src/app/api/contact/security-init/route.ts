/*
 * Karma Industrial Safety Training Website
 * Written and developed by Gabriel Lacroix for Evergreen Web Solutions
 *
 * File: src/app/api/contact/security-init/route.ts
 * Description: API route for initializing security context for the contact form, including CSRF token generation and public session creation.
 * Dependencies: Next.js, Vercel Postgres, csrf, logger
 * Created: 2025-07-17
 * Last Modified: 2025-08-03
 * Version: 1.0.2
 */
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