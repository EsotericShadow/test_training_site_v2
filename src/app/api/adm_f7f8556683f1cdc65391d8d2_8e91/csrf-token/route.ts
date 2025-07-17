// src/app/api/adm_f7f8556683f1cdc65391d8d2_8e91/csrf-token/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
import { handleCsrfTokenRequest } from '../../../../../lib/csrf';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const result = await handleCsrfTokenRequest(request);
  return NextResponse.json(result.body, { status: result.status });
}
