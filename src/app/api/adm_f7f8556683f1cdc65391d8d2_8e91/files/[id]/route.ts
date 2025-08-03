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
import { NextRequest, NextResponse } from 'next/server';
import { filesOps } from '../../../../../../lib/database';
import { validateSession } from '../../../../../../lib/session-manager';
import { validateInput } from '../../../../../../lib/security-utils';

// Define the expected context type (params is now a Promise in Next.js 15)
interface RouteContext {
  params: Promise<{ id: string }>;
}

async function handleRequest(
  request: NextRequest,
  params: { id: string },
  callback: (id: number) => Promise<NextResponse>
) {
  const token = request.cookies.get('admin_token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized: No session token' }, { status: 401 });
  }
  const authResult = await validateSession(token, request);
  if (!authResult.valid) {
    return NextResponse.json({ error: `Unauthorized: ${authResult.reason}` }, { status: 401 });
  }

  const id = parseInt(params.id, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid file ID' }, { status: 400 });
  }

  return callback(id);
}

// GET - Get a single file by ID
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  const params = await context.params;
  return handleRequest(request, params, async (id) => {
    try {
      const file = await filesOps.getById(id);
      if (!file) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
      }
      return NextResponse.json({ file });
    } catch (error) {
      console.error(`Error fetching file ${id}:`, error);
      return NextResponse.json({ error: 'Failed to fetch file' }, { status: 500 });
    }
  });
}

// PUT - Update a file's metadata
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  const params = await context.params;
  return handleRequest(request, params, async (id) => {
    try {
      const data = await request.json();
      
      const validationResult = validateInput.fileMetadata(data);
      if (!validationResult.success) {
          return NextResponse.json({ error: validationResult.error }, { status: 400 });
      }

      const updatedFile = await filesOps.update(id, validationResult.data);
      if (!updatedFile) {
        return NextResponse.json({ error: 'File not found or failed to update' }, { status: 404 });
      }
      return NextResponse.json({ file: updatedFile });
    } catch (error) {
      console.error(`Error updating file ${id}:`, error);
      return NextResponse.json({ error: 'Failed to update file' }, { status: 500 });
    }
  });
}

// DELETE - Delete a file
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  const params = await context.params;
  return handleRequest(request, params, async (id) => {
    try {
      await filesOps.delete(id);
      return NextResponse.json({ message: 'File deleted successfully' });
    } catch (error) {
      console.error(`Error deleting file ${id}:`, error);
      return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
    }
  });
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