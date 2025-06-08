import { NextResponse } from 'next/server';
import { withSecureAuth } from '../../../../lib/secure-jwt';
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

// POST - Create new team member (ADMIN ONLY - SECURED)
async function createTeamMember(request) {
  try {
    const data = await request.json();
    if (!data.name || !data.role) {
      return NextResponse.json(
        { error: 'Name and role are required' },
        { status: 400 }
      );
    }

    const result = await teamMembersOps.create(data);
    return NextResponse.json({
      success: true,
      message: '✓ Team member created successfully',
      teamMemberId: result.id
    });
  } catch (error) {
    console.error('Error creating team member:', error);
    return NextResponse.json(
      { error: 'Failed to create team member' },
      { status: 500 }
    );
  }
}

// Export routes - GET remains public, POST is secured
export const POST = withSecureAuth(createTeamMember);

