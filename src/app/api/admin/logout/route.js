import { NextResponse } from 'next/server';
import { adminSessionsOps } from '../../../../../lib/database';

export async function POST() {
  try {
    const token = request.cookies.get('admin_token')?.value;

    if (token) {
      // Remove session from database
      await adminSessionsOps.delete(token);
    }

    // Clear cookie
    const response = NextResponse.json({ success: true });
    response.cookies.delete('admin_token');

    return response;

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}