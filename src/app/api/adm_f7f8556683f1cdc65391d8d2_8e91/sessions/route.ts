import { NextResponse, NextRequest } from 'next/server';

export const runtime = 'nodejs';
import { withSecureAuth, AuthResult } from '../../../../../lib/secure-jwt';
import { logger, handleApiError } from '../../../../../lib/logger';
import { getUserSessions, terminateOtherSessions } from '../../../../../lib/session-manager';
import { validateToken } from '../../../../../lib/csrf';

// Define the expected signature for a Next.js App Router API Handler.
type AppRouteHandlerFn = (
  req: NextRequest,
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  context: { params: Promise<{}> } // This route has no dynamic segments
) => Promise<NextResponse>;

// GET handler to list all active sessions for the current user
async function getSessionsList(
  request: NextRequest,
  context: { params: Record<string, string | string[]>; auth: AuthResult }
): Promise<NextResponse> {
  try {
    const { auth } = context;
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    logger.info('Session list request', { ip, route: request.nextUrl.pathname, method: request.method });

    if (!auth.user || !auth.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = auth.user.id;
    const currentToken = auth.session.token;
    const sessions = await getUserSessions(userId);

    const formattedSessions = sessions.map(session => ({
      id: session.id,
      createdAt: session.created_at,
      expiresAt: session.expires_at,
      lastActivity: session.last_activity,
      ipAddress: session.ip_address,
      userAgent: session.user_agent,
      current: session.token === currentToken
    }));

    logger.info('Session list successful', { ip, userId, sessionCount: sessions.length });
    return NextResponse.json({ sessions: formattedSessions });
  } catch (error) {
    const errorResponse = await handleApiError(error, request, 'Failed to list sessions');
    return NextResponse.json({ error: errorResponse.error }, { status: errorResponse.status });
  }
}

// DELETE handler to terminate all other sessions
async function terminateOtherUserSessions(
  request: NextRequest,
  context: { params: Record<string, string | string[]>; auth: AuthResult }
): Promise<NextResponse> {
  try {
    const { auth } = context;
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    logger.info('Terminate other sessions request', { ip, route: request.nextUrl.pathname, method: request.method });

    if (!auth.user || !auth.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = auth.user.id;
    const currentToken = auth.session.token;
    const csrfToken = request.headers.get('x-csrf-token');
    if (!csrfToken || !await validateToken(auth.session.id, csrfToken)) {
      logger.warn('Terminate other sessions failed: Invalid CSRF token', { ip, userId });
      return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
    }

    const count = await terminateOtherSessions(userId, currentToken);

    logger.info('Terminate other sessions successful', { ip, userId, terminatedCount: count });
    return NextResponse.json({ success: true, terminatedCount: count });
  } catch (error) {
    const errorResponse = await handleApiError(error, request, 'Failed to terminate other sessions');
    return NextResponse.json({ error: errorResponse.error }, { status: errorResponse.status });
  }
}

// Export secured routes
export const GET = withSecureAuth(getSessionsList) as unknown as AppRouteHandlerFn;
export const DELETE = withSecureAuth(terminateOtherUserSessions) as unknown as AppRouteHandlerFn;