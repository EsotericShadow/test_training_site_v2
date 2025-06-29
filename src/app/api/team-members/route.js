import { NextResponse } from 'next/server';
import { teamMembersOps } from '../../../../lib/database';

// GET - Get all team members (PUBLIC ACCESS for homepage)
export async function GET() {
  try {
    const teamMembers = await teamMembersOps.getAll();
    return NextResponse.json(teamMembers);
  } catch (error) {
    console.error('Error fetching team members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team members' },
      { status: 500 }
    );
  }
}



// Export routes - GET remains public, POST is secured
// export const POST = withSecureAuth(createTeamMember);

