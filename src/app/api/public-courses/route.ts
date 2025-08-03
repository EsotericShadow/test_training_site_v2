import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { logger, handleApiError } from '../../../../lib/logger';

export const runtime = 'nodejs';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const route = request.nextUrl.pathname;

    logger.info('Public courses data request', { ip, route, method: request.method });

    const { searchParams } = request.nextUrl;
    const featured = searchParams.get('featured') === 'true';
    const limit = parseInt(searchParams.get('limit') || '0', 10);

    let coursesResult;

    if (featured && limit > 0) {
      coursesResult = await sql`
        SELECT 
          c.id,
          c.slug,
          c.title,
          c.description,
          c.duration,
          c.audience,
          c.popular,
          c.image_url,
          c.image_alt,
          cc.name as category_name
        FROM courses c
        LEFT JOIN course_categories cc ON c.category_id = cc.id
        WHERE c.popular = TRUE
        ORDER BY RANDOM()
        LIMIT ${limit}
      `;
    } else {
      coursesResult = await sql`
        SELECT 
          c.id,
          c.slug,
          c.title,
          c.description,
          c.duration,
          c.audience,
          c.popular,
          c.image_url,
          c.image_alt,
          cc.name as category_name
        FROM courses c
        LEFT JOIN course_categories cc ON c.category_id = cc.id
        ORDER BY c.title ASC
      `;
    }

    const courses = coursesResult.rows.map(row => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      description: row.description,
      duration: row.duration,
      audience: row.audience,
      popular: row.popular,
      image_url: row.image_url,
      image_alt: row.image_alt,
      category: row.category_name ? { name: row.category_name } : undefined,
    }));

    return NextResponse.json({ courses });
  } catch (error: unknown) {
    const errorResponse = await handleApiError(error, request, 'Failed to fetch public courses data');
    return NextResponse.json(
      { error: errorResponse.error },
      { status: errorResponse.status }
    );
  }
}