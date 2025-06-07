// src/app/api/admin/csrf-token/route.js
import { NextResponse } from 'next/server';
import { handleCsrfTokenRequest } from '../../../../../lib/csrf';

export async function GET(request) {
  const result = await handleCsrfTokenRequest(request);
  return NextResponse.json(result.body, { status: result.status });
}
