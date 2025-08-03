/*
 * Karma Industrial Safety Training Website
 * Written and developed by Gabriel Lacroix for Evergreen Web Solutions
 *
 * File: src/app/api/team-members/route.ts
 * Description: API route for fetching all team members.
 * Dependencies: Next.js, Vercel Postgres, logger
 * Created: 2025-07-17
 * Last Modified: 2025-08-03
 * Version: 1.0.2
 */
import { NextResponse } from 'next/server';
import { teamMembersOps } from '../../../../lib/database';
import { logger } from '../../../../lib/logger';

export const runtime = 'nodejs'; // Ensure Node.js for database

export async function GET() {
  try {
    const teamMembers = await teamMembersOps.getAll();
    return NextResponse.json({ teamMembers });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to fetch public team members', { error: message });
    return NextResponse.json({ message: 'Failed to fetch team members' }, { status: 500 });
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