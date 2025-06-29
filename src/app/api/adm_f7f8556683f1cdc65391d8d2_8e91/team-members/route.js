import { NextResponse } from 'next/server';
import { withSecureAuth } from '../../../../../lib/secure-jwt';
import { teamMembersOps } from '../../../../../lib/database';
import { sanitizeInput, validateInput } from '../../../../../lib/security-utils';
import { validateToken } from '../../../../../lib/csrf';

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

// POST - Create new team member (SECURED)
async function createTeamMember(request) {
  try {
    const adminToken = request.cookies.get('admin_token')?.value;
    const csrfToken = request.headers.get('x-csrf-token');

    if (!validateToken(adminToken, csrfToken)) {
      return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
    }

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

    // Create the team member
    const result = await teamMembersOps.create(teamMemberData);

    return NextResponse.json({
      success: true,
      message: 'Team member created successfully',
      teamMember: result
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating team member:', error);
    return NextResponse.json(
      { error: 'Failed to create team member' },
      { status: 500 }
    );
  }
}

// Export secured routes
export const GET = withSecureAuth(getTeamMembersForAdmin);
export const POST = withSecureAuth(createTeamMember);

