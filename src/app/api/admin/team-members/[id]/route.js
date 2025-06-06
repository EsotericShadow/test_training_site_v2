import { NextResponse } from 'next/server';
import { teamMembersOps } from '../../../../../../lib/database';

// GET - Get team member by ID
export async function GET(request, { params }) {
  try {
    const teamMember = await teamMembersOps.getById(params.id);
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

// PUT - Update team member
export async function PUT(request, { params }) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.name || !data.role) {
      return NextResponse.json(
        { error: 'Missing required fields: name, role' },
        { status: 400 }
      );
    }

    // Check if team member exists
    const existing = await teamMembersOps.getById(params.id);
    if (!existing) {
      return NextResponse.json(
        { error: 'Team member not found' },
        { status: 404 }
      );
    }

    // Update the team member
    await teamMembersOps.update(params.id, data);

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

// DELETE - Delete team member
export async function DELETE(request, { params }) {
  try {
    // Check if team member exists
    const existing = await teamMembersOps.getById(params.id);
    if (!existing) {
      return NextResponse.json(
        { error: 'Team member not found' },
        { status: 404 }
      );
    }

    // Delete the team member
    await teamMembersOps.delete(params.id);

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