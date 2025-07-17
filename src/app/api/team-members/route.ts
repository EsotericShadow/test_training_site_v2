import { NextResponse } from 'next/server';
import { teamMembersOps } from '../../../../lib/database';
import { logger } from '../../../../lib/logger';

export const runtime = 'nodejs'; // Ensure Node.js for database

export async function GET() {
  try {
    const teamMembers = await teamMembersOps.getAll();
    return NextResponse.json({ teamMembers });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to fetch public team members', { error: message });
    return NextResponse.json({ message: 'Failed to fetch team members' }, { status: 500 });
  }
}
