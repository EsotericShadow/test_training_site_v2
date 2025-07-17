// src/app/api/adm_f7f8556683f1cdc65391d8d2_8e91/files/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { filesOps } from '../../../../../lib/database';
import { validateSession } from '../../../../../lib/session-manager';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized: No session token' }, { status: 401 });
  }
  const authResult = await validateSession(token, request);
  if (!authResult.valid) {
    return NextResponse.json(
      { error: `Unauthorized: ${authResult.reason}` },
      { status: 401 }
    );
  }

  try {
    const files = await filesOps.getAll();
    return NextResponse.json({ files });
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch files' },
      { status: 500 }
    );
  }
}
