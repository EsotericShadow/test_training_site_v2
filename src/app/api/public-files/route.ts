
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { logger, handleApiError } from '../../../../lib/logger';

export const runtime = 'nodejs';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const route = request.nextUrl.pathname;
    const { searchParams } = request.nextUrl;
    const category = searchParams.get('category');

    logger.info('Public files data request', { ip, route, method: request.method, category });

    if (!category) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 });
    }

    const filesResult = await sql`
      SELECT 
        id,
        blob_url,
        alt_text
      FROM files
      WHERE category = ${category}
    `;

    return NextResponse.json({ files: filesResult.rows });
  } catch (error: unknown) {
    const errorResponse = await handleApiError(error, request, 'Failed to fetch public files data');
    return NextResponse.json(
      { error: errorResponse.error },
      { status: errorResponse.status }
    );
  }
}
