// src/app/api/adm_f7f8556683f1cdc65391d8d2_8e91/files/[id]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { filesOps } from '../../../../../../lib/database';
import { validateSession } from '../../../../../../lib/session-manager';
import { validateInput } from '../../../../../../lib/security-utils';

interface RouteContext {
  params: {
    id: string;
  };
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
export async function GET(request: NextRequest, { params }: RouteContext) {
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
export async function PUT(request: NextRequest, { params }: RouteContext) {
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
export async function DELETE(request: NextRequest, { params }: RouteContext) {
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
