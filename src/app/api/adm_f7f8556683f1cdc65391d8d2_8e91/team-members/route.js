import { NextResponse } from 'next/server';
import { withSecureAuth } from '../../../../../lib/secure-jwt';
import { teamMembersOps } from '../../../../../lib/database';

// GET - Get all team members for admin management (SECURED)
async function getTeamMembersForAdmin() {
  try {
    const teamMembers = await teamMembersOps.getAll();
    return NextResponse.json({ teamMembers });
  } catch (error) {
    console.error('Error fetching team members for admin:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team members' },
      { status: 500 }
    );
  }
}

// Export secured route
export const GET = withSecureAuth(getTeamMembersForAdmin);

