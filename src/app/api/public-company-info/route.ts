import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { logger, handleApiError } from '../../../../lib/logger';

export const runtime = 'nodejs';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const route = request.nextUrl.pathname;

    logger.info('Public company info data request', { ip, route, method: request.method });

    const companyInfoResult = await sql`SELECT * FROM company_info LIMIT 1`;
    const companyValuesResult = await sql`SELECT * FROM company_values ORDER BY display_order ASC`;
    const companyWhyChooseUsResult = await sql`SELECT * FROM company_why_choose_us ORDER BY display_order ASC`;

    const companyInfo = companyInfoResult.rows[0] || {};
    const companyValues = companyValuesResult.rows || [];
    const companyWhyChooseUs = companyWhyChooseUsResult.rows || [];

    return NextResponse.json({
      companyInfo,
      companyValues,
      companyWhyChooseUs,
    });
  } catch (error: unknown) {
    const errorResponse = await handleApiError(error, request, 'Failed to fetch public company info data');
    return NextResponse.json(
      { error: errorResponse.error },
      { status: errorResponse.status }
    );
  }
}
