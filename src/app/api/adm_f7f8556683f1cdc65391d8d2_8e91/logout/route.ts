/*
 * Evergreen Web Solutions
 * Written and developed by Gabriel Lacroix
 *
 * File: route.ts
 * Description: To be filled in with the script's purpose
 * Dependencies: To be filled in with key dependencies or modules
 * Created: August 2, 2025
 * Last Modified: August 2, 2025
 * Version: 1.0.0
 */
// src/app/api/adm_f7f8556683f1cdc65391d8d2_8e91/logout/route.ts
import { NextResponse, NextRequest } from 'next/server';

export const runtime = 'nodejs';
import { validateSession, terminateSession } from '../../../../../lib/session-manager';
import { logger } from '../../../../../lib/logger';
import { validateToken } from '../../../../../lib/csrf';

export async function POST(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value;

  if (!token) {
    // No token, so nothing to do.
    return NextResponse.json({ success: true, message: 'Already logged out' });
  }

  try {
    const sessionResult = await validateSession(token, request);

    if (!sessionResult.valid || !sessionResult.session) {
      logger.warn('Logout failed: Invalid session', { ip: request.headers.get('x-forwarded-for') || 'unknown' });
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const csrfToken = request.headers.get('x-csrf-token');
    if (!csrfToken || !await validateToken(sessionResult.session.id, csrfToken)) {
      logger.warn('Logout failed: Invalid CSRF token', { ip: request.headers.get('x-forwarded-for') || 'unknown', userId: sessionResult.session.user_id });
      return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
    }

    await terminateSession(String(sessionResult.session.id), sessionResult.session.user_id);
    logger.info('Logout successful', { 
      ip: request.headers.get('x-forwarded-for') || 'unknown', 
      userId: sessionResult.session.user_id 
    });

    const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
    response.cookies.set('admin_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: -1,
      path: '/',
      sameSite: 'lax',
    });

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Logout failed', { 
      ip: request.headers.get('x-forwarded-for') || 'unknown', 
      error: message 
    });
    const response = NextResponse.json({ error: 'Logout failed' }, { status: 500 });
    // Attempt to clear cookie even on error
    response.cookies.set('admin_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: -1,
      path: '/',
      sameSite: 'lax',
    });
    return response;
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
//                           \/                                       \/     \/                 