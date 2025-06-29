import { NextResponse } from 'next/server';
import { withSecureAuth } from '../../../../../../lib/secure-jwt';
import { teamMembersOps } from '../../../../../../lib/database';
import { sanitizeInput, validateInput } from '../../../../../../lib/security-utils';

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

    // Sanitize input
    const sanitizedData = {
      name: sanitizeInput.text(data.name),
      role: sanitizeInput.text(data.role),
      bio: sanitizeInput.text(data.bio),
      photo_url: sanitizeInput.text(data.photo_url),
      experience_years: data.experience_years,
      specializations: data.specializations,
      featured: data.featured,
      display_order: data.display_order,
    };

    // Validate input
    const validationResult = validateInput.teamMember(sanitizedData);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error },
        { status: 400 }
      );
    }

    // Ensure numeric and boolean fields are correctly parsed after validation
    const teamMemberData = {
      ...validationResult.data,
      experience_years: validationResult.data.experience_years !== undefined ? parseInt(validationResult.data.experience_years) : null,
      featured: Boolean(validationResult.data.featured),
      display_order: validationResult.data.display_order !== undefined ? parseInt(validationResult.data.display_order) : 0,
      specializations: JSON.stringify(validationResult.data.specializations || [])
    };

    // Check if team member exists
    const existing = await teamMembersOps.getById(id);
    if (!existing) {
      return NextResponse.json(
        { error: 'Team member not found' },
        { status: 404 }
      );
    }

    // Update the team member
    await teamMembersOps.update(id, teamMemberData);

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

