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

// POST - Create new team member (SECURED)
async function createTeamMember(request) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.name || !data.role) {
      return NextResponse.json(
        { error: 'Missing required fields: name, role' },
        { status: 400 }
      );
    }

    // Validate data types and sanitize input
    const teamMemberData = {
      name: String(data.name).trim(),
      role: String(data.role).trim(),
      bio: data.bio ? String(data.bio).trim() : null,
      photo_url: data.photo_url ? String(data.photo_url).trim() : null,
      experience_years: data.experience_years ? parseInt(data.experience_years) : null,
      specializations: Array.isArray(data.specializations) 
        ? data.specializations.filter(s => s && String(s).trim() !== '').map(s => String(s).trim())
        : [],
      featured: Boolean(data.featured),
      display_order: data.display_order ? parseInt(data.display_order) : 0,
    };

    // Validate experience_years if provided
    if (teamMemberData.experience_years !== null && (teamMemberData.experience_years < 0 || teamMemberData.experience_years > 100)) {
      return NextResponse.json(
        { error: 'Experience years must be between 0 and 100' },
        { status: 400 }
      );
    }

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

