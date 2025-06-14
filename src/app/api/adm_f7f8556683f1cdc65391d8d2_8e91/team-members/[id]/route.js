import { NextResponse } from 'next/server';
import { withSecureAuth } from '../../../../../../lib/secure-jwt';
import { teamMembersOps } from '../../../../../../lib/database';

// GET - Get team member by ID (SECURED)
async function getTeamMember(request, { params }) {
  try {
    // Await params before accessing properties (Next.js 15 requirement)
    const { id } = await params;
    
    const teamMember = await teamMembersOps.getById(id);
    if (!teamMember) {
      return NextResponse.json(
        { error: 'Team member not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(teamMember);
  } catch (error) {
    console.error('Error fetching team member:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team member' },
      { status: 500 }
    );
  }
}

// PUT - Update team member (SECURED)
async function updateTeamMember(request, { params }) {
  try {
    // Await params before accessing properties (Next.js 15 requirement)
    const { id } = await params;
    
    const data = await request.json();

    // Validate required fields
    if (!data.name || !data.role) {
      return NextResponse.json(
        { error: 'Missing required fields: name, role' },
        { status: 400 }
      );
    }

    // Check if team member exists
    const existing = await teamMembersOps.getById(id);
    if (!existing) {
      return NextResponse.json(
        { error: 'Team member not found' },
        { status: 404 }
      );
    }

    // Update the team member
    await teamMembersOps.update(id, data);

    return NextResponse.json({
      success: true,
      message: 'Team member updated successfully',
    });
  } catch (error) {
    console.error('Error updating team member:', error);
    return NextResponse.json(
      { error: 'Failed to update team member' },
      { status: 500 }
    );
  }
}

// DELETE - Delete team member (SECURED)
async function deleteTeamMember(request, { params }) {
  try {
    // Await params before accessing properties (Next.js 15 requirement)
    const { id } = await params;
    
    // Check if team member exists
    const existing = await teamMembersOps.getById(id);
    if (!existing) {
      return NextResponse.json(
        { error: 'Team member not found' },
        { status: 404 }
      );
    }

    // Delete the team member
    await teamMembersOps.delete(id);

    return NextResponse.json({
      success: true,
      message: 'Team member deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting team member:', error);
    return NextResponse.json(
      { error: 'Failed to delete team member' },
      { status: 500 }
    );
  }
}

// Export secured routes - ALL METHODS NOW REQUIRE AUTHENTICATION
export const GET = withSecureAuth(getTeamMember);
export const PUT = withSecureAuth(updateTeamMember);
export const DELETE = withSecureAuth(deleteTeamMember);

