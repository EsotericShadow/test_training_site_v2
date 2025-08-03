import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { logger, handleApiError } from '../../../../lib/logger';

export const runtime = 'nodejs';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const route = request.nextUrl.pathname;

    logger.info('Public hero section data request', { ip, route, method: request.method });

    const heroSectionResult = await sql`SELECT * FROM hero_section LIMIT 1`;
    const heroStatsResult = await sql`SELECT * FROM hero_stats ORDER BY display_order ASC`;
    const heroFeaturesResult = await sql`SELECT * FROM hero_features ORDER BY display_order ASC`;

    const heroSection = heroSectionResult.rows[0] || {};
    const heroStats = heroStatsResult.rows || [];
    const heroFeatures = heroFeaturesResult.rows || [];

    return NextResponse.json({
      heroSection,
      heroStats,
      heroFeatures,
    });
  } catch (error: unknown) {
    const errorResponse = await handleApiError(error, request, 'Failed to fetch public hero section data');
    return NextResponse.json(
      { error: errorResponse.error },
      { status: errorResponse.status }
    );
  }
}
