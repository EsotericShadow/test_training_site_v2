import { NextResponse, NextRequest } from 'next/server';

export const runtime = 'nodejs';
import { withSecureAuth } from '../../../../../../lib/secure-jwt';
import { teamMembersOps, TeamMember } from '../../../../../../lib/database';
import { sanitizeInput, validateInput } from '../../../../../../lib/security-utils';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

// GET - Get team member by ID (SECURED)
async function getTeamMember(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    
    const teamMember = await teamMembersOps.getById(parseInt(id));
    if (!teamMember) {
      return NextResponse.json(
        { error: 'Team member not found' },
        { status: 404 }
      );
    }
    // Normalize specializations to ensure it's an array
    const normalizedTeamMember = {
      ...teamMember,
      specializations: teamMember.specializations ?? []
    };
    return NextResponse.json(normalizedTeamMember);
  } catch (error) {
    console.error('Error fetching team member:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team member' },
      { status: 500 }
    );
  }
}

// PUT - Update team member (SECURED)
async function updateTeamMember(request: NextRequest, { params }: RouteContext) {
  try {
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
    const teamMemberData: Partial<TeamMember> = {
      ...validationResult.data,
      featured: Boolean(validationResult.data.featured),
      display_order: validationResult.data.display_order !== undefined ? parseInt(validationResult.data.display_order as string) : 0,
      specializations: Array.isArray(validationResult.data.specializations) ? validationResult.data.specializations : []
    };

    if (validationResult.data.experience_years !== undefined) {
      teamMemberData.experience_years = parseInt(validationResult.data.experience_years as string);
    }

    // Check if team member exists
    const existing = await teamMembersOps.getById(parseInt(id));
    if (!existing) {
      return NextResponse.json(
        { error: 'Team member not found' },
        { status: 404 }
      );
    }

    // Update the team member
    await teamMembersOps.update(parseInt(id), teamMemberData as TeamMember);

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
async function deleteTeamMember(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    
    // Check if team member exists
    const existing = await teamMembersOps.getById(parseInt(id));
    if (!existing) {
      return NextResponse.json(
        { error: 'Team member not found' },
        { status: 404 }
      );
    }

    // Delete the team member
    await teamMembersOps.delete(parseInt(id));

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