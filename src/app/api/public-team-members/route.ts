import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { logger, handleApiError } from '../../../../lib/logger';

export const runtime = 'nodejs';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const route = request.nextUrl.pathname;

    logger.info('Public team members data request', { ip, route, method: request.method });

    const teamMembersResult = await sql`SELECT id, name, role, photo_url FROM team_members ORDER BY display_order ASC`;

    const teamMembers = teamMembersResult.rows || [];

    return NextResponse.json({ teamMembers });
  } catch (error: unknown) {
    const errorResponse = await handleApiError(error, request, 'Failed to fetch public team members data');
    return NextResponse.json(
      { error: errorResponse.error },
      { status: errorResponse.status }
    );
  }
}
