/*
 * Karma Industrial Safety Training Website
 * Written and developed by Gabriel Lacroix for Evergreen Web Solutions
 *
 * File: src/app/api/adm_f7f8556683f1cdc65391d8d2_8e91/csrf-token/route.ts
 * Description: API route for handling CSRF token requests.
 * Dependencies: Next.js, csrf
 * Created: 2025-06-07
 * Last Modified: 2025-08-03
 * Version: 1.0.2
 */
// src/app/api/adm_f7f8556683f1cdc65391d8d2_8e91/csrf-token/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
import { handleCsrfTokenRequest } from '../../../../../lib/csrf';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const result = await handleCsrfTokenRequest(request);
  return NextResponse.json(result.body, { status: result.status });
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