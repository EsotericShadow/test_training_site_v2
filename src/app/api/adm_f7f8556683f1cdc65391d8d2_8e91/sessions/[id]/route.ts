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
import { NextResponse, NextRequest } from 'next/server';

export const runtime = 'nodejs';
import { withSecureAuth, AuthResult } from '../../../../../../lib/secure-jwt';
import { logger, handleApiError } from '../../../../../../lib/logger';
import { terminateSession } from '../../../../../../lib/session-manager';
import { validateToken } from '../../../../../../lib/csrf';

// DELETE handler to terminate a specific session
async function terminateSpecificSession(
  request: NextRequest, 
  { params, auth }: { params: Promise<{ id: string }>; auth: AuthResult }
) {
  try {
    // Get session ID from URL params
    const resolvedParams = await params;
    const sessionId = parseInt(resolvedParams.id, 10);
    
    // Get client IP address
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    
    // Log request
    logger.info('Terminate session request', { 
      ip, 
      route: request.nextUrl.pathname,
      method: request.method,
      sessionId
    });
    
    // Get user ID from auth (provided by withSecureAuth)
    const userId = auth.user?.id;

    if (typeof userId !== 'number') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const csrfToken = request.headers.get('x-csrf-token');
    if (!csrfToken || !auth.session || !await validateToken(auth.session.id, csrfToken)) {
      logger.warn('Terminate specific session failed: Invalid CSRF token', { ip, userId, sessionId });
      return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
    }
    
    // Terminate the specified session
    const success = await terminateSession(String(sessionId), userId);
    
    if (!success) {
      logger.warn('Terminate session failed: Unauthorized or not found', { ip, userId, sessionId });
      
      return NextResponse.json(
        { error: 'Unauthorized or session not found' },
        { status: 403 }
      );
    }
    
    logger.info('Terminate session successful', { ip, userId, sessionId });
    
    return NextResponse.json({
      success: true
    });
    
  } catch (error) {
    // Use the handleApiError utility for consistent error handling
    const errorResponse = await handleApiError(error, request, 'Failed to terminate session');
    
    return NextResponse.json(
      { error: errorResponse.error },
      { status: errorResponse.status }
    );
  }
}

// Export secured route
export const DELETE = withSecureAuth(terminateSpecificSession);


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