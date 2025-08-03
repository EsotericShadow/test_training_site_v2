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
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
import { teamMembersOps, companyInfoOps, whyChooseUsOps, companyValuesOps } from '../../../../lib/database';

export async function GET() {
  try {
    const [teamMembers, companyInfo, whyChooseUs, companyValues] = await Promise.all([
      teamMembersOps.getAll(),
      companyInfoOps.get(),
      whyChooseUsOps.getAll(),
      companyValuesOps.getAll(),
    ]);

    const sortedTeamMembers = Array.isArray(teamMembers)
      ? teamMembers
          .filter(member => member.featured)
          .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
          .slice(0, 4)
      : [];

    return NextResponse.json({
      teamMembers: sortedTeamMembers,
      companyInfo,
      whyChooseUs,
      companyValues,
    });
  } catch (error) {
    console.error('Error fetching about snippet data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch about snippet data' },
      { status: 500 }
    );
  }
}


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