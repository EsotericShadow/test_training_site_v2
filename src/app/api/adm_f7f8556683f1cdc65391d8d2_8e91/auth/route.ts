/*
 * Karma Industrial Safety Training Website
 * Written and developed by Gabriel Lacroix for Evergreen Web Solutions
 *
 * File: src/app/api/adm_f7f8556683f1cdc65391d8d2_8e91/auth/route.ts
 * Description: API route for verifying admin authentication status.
 * Dependencies: Next.js, Vercel Postgres, secure-jwt
 * Created: 2025-06-06
 * Last Modified: 2025-08-03
 * Version: 1.0.2
 */
// src/app/api/adm_f7f8556683f1cdc65391d8d2_8e91/auth/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
import { logger, handleApiError } from '../../../../../lib/logger';
import { validateSession, renewSession, SessionValidationResult } from '../../../../../lib/session-manager';
import { AdminSession } from '../../../../../types/database';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    
    logger.info('Auth check attempt', { 
      ip, 
      route: request.nextUrl.pathname,
      method: request.method
    });
    
    const token = request.cookies.get('admin_token')?.value;

    if (!token) {
      logger.warn('Auth check failed: No token', { ip });
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const sessionResult: SessionValidationResult = await validateSession(token, request);
    
    if (!sessionResult.valid || !sessionResult.session) {
      logger.warn(`Auth check failed: ${sessionResult.reason}`, { ip });
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const session: AdminSession = sessionResult.session;
    
    const response = NextResponse.json({
      authenticated: true,
      user: {
        id: session.user_id,
        username: session.username,
        email: session.email
      }
    });
    
    if (sessionResult.needsRenewal) {
      logger.info('Renewing session', { ip, userId: session.user_id });
      const renewalData = await renewSession(session, request);
      response.cookies.set('admin_token', renewalData.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: renewalData.maxAge
      });
    }

    logger.info('Auth check successful', { 
      ip, 
      userId: session.user_id,
      username: session.username
    });

    return response;
  } catch (error: unknown) {
    const errorResponse = await handleApiError(error, request, 'Authentication check failed');
    return NextResponse.json(
      { error: errorResponse.error },
      { status: errorResponse.status }
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