/*
 * Evergreen Web Solutions
 * Written and developed by Gabriel Lacroix
 *
 * File: route.ts
 * Description: To be filled in with the script's purpose
 * Dependencies: To be filled in with key dependencies or modules
 * Created: August 2, 2025
 * Last Modified: August 2, 2025
 * Version: 1.0.0
 */
import { NextResponse, NextRequest } from 'next/server';

export const runtime = 'nodejs';
import { withSecureAuth } from '../../../../../lib/secure-jwt';
import { teamMembersOps, TeamMember } from '../../../../../lib/database';
import { sanitizeInput, validateInput } from '../../../../../lib/security-utils';
import { validateToken } from '../../../../../lib/csrf';
import { validateSession } from '../../../../../lib/session-manager';

// Define the expected signature for a Next.js App Router API Handler.
type AppRouteHandlerFn = (
  req: NextRequest,
  context: { params: Promise<string> }
) => Promise<NextResponse>;

// GET - Get all team members for admin management (SECURED)
async function getTeamMembers(
  _request: NextRequest,
  _context: { params: unknown }
): Promise<NextResponse> {
  try {
    const teamMembers = await teamMembersOps.getAll();
    // Ensure specializations is always an array
    const normalizedTeamMembers = teamMembers.map(member => ({
      ...member,
      specializations: typeof member.specializations === 'string'
        ? JSON.parse(member.specializations)
        : member.specializations || []
    }));
    return NextResponse.json({ teamMembers: normalizedTeamMembers });
  } catch (error) {
    console.error('Error fetching team members for admin:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team members' },
      { status: 500 }
    );
  }
}

// POST - Create new team member (SECURED)
async function createTeamMember(
  request: NextRequest,
  _context: { params: unknown }
): Promise<NextResponse> {
  try {
    const adminToken = request.cookies.get('admin_token')?.value;
    const csrfToken = request.headers.get('x-csrf-token');
    if (!adminToken) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }
    const sessionResult = await validateSession(adminToken, request);

    if (!sessionResult.valid || !sessionResult.session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    if (!csrfToken || !validateToken(sessionResult.session.id, csrfToken)) {
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
    const teamMemberData: Partial<TeamMember> = {
      ...validationResult.data,
      featured: Boolean(validationResult.data.featured),
      display_order: validationResult.data.display_order !== undefined ? parseInt(validationResult.data.display_order as string) : 0,
      specializations: (validationResult.data.specializations as string[] | undefined) ?? []
    };

    if (validationResult.data.experience_years !== undefined) {
      teamMemberData.experience_years = parseInt(validationResult.data.experience_years as string);
    }

    // Create the team member
    const result = await teamMembersOps.create(teamMemberData as TeamMember);

    return NextResponse.json({
      success: true,
      message: 'Team member created successfully',
      teamMember: {
        ...result,
        specializations: validationResult.data.specializations || []
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating team member:', error);
    return NextResponse.json(
      { error: 'Failed to create team member' },
      { status: 500 }
    );
  }
}

// Export routes
export const GET: AppRouteHandlerFn = withSecureAuth(getTeamMembers);
export const POST: AppRouteHandlerFn = withSecureAuth(createTeamMember);



//   ___________       *Written and developed by Gabriel Lacroix*               __      ___.
//   \_   _____/__  __ ___________  ___________   ____   ____   ____   /  \    /  \ ____\_ |__  
//    |    __)_\  \/ // __ \_  __ \/ ___\_  __ \_/ __ \_/ __ \ /    \  \   \/\/   // __ \| __ \ 
//    |        \\   /\  ___/|  | \/ /_/  >  | \/\  ___/\  ___/|   |  \  \        /\  ___/| \_\ \
//   /_______  / \_/  \___  >__|  \___  /|__|    \___  >\___  >___|  /   \__/\  /  \___  >___  /
//           \/           \/     /_____/             \/     \/     \/         \/       \/    \/ 
//                     _________      .__          __  .__                                      
//                    /   _____/ ____ |  |  __ ___/  |_|__| ____   ____   ______                
//                    \_____  \ /  _ \|  | |  |  \   __\  |/  _ \ /    \ /  ___/                
//                    /        (  <_> )  |_|  |  /|  | |  (  <_> )   |  \\___ \                 
//                   /_______  /\____/|____/____/ |__| |__|\____/|___|  /____  >                
//                           \/ https://www.evergreenwebsolutions.ca  \/     \/                 