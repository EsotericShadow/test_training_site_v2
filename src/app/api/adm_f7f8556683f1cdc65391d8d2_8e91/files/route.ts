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
// src/app/api/adm_f7f8556683f1cdc65391d8d2_8e91/files/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { filesOps } from '../../../../../lib/database';
import { validateSession } from '../../../../../lib/session-manager';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized: No session token' }, { status: 401 });
  }
  const authResult = await validateSession(token, request);
  if (!authResult.valid) {
    return NextResponse.json(
      { error: `Unauthorized: ${authResult.reason}` },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    let files;
    if (category) {
      files = await filesOps.getByCategory(category);
    } else {
      files = await filesOps.getAll();
    }

    if (category && files.length > 0) {
      const randomIndex = Math.floor(Math.random() * files.length);
      return NextResponse.json({ file: files[randomIndex] });
    } else if (category && files.length === 0) {
      return NextResponse.json({ error: 'No files found for this category' }, { status: 404 });
    }

    return NextResponse.json({ files });
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch files' },
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
//                           \/                                       \/     \/                 