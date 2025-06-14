import { NextResponse } from 'next/server';
import { withSecureAuth } from '../../../../../../lib/secure-jwt';
import { filesOps } from '../../../../../../lib/database';
import { del } from '@vercel/blob';

// GET - Get specific file for editing (Phase 3)
async function getFile(request, { params }) {
  try {
    // Await params before accessing properties (Next.js 15 requirement)
    const resolvedParams = await params;
    const fileId = parseInt(resolvedParams.id);
    
    if (isNaN(fileId)) {
      return NextResponse.json(
        { error: 'Invalid file ID' },
        { status: 400 }
      );
    }

    const file = await filesOps.getById(fileId);
    
    if (!file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      file: file
    });
  } catch (error) {
    console.error('Error fetching file:', error);
    return NextResponse.json(
      { error: 'Failed to fetch file' },
      { status: 500 }
    );
  }
}

// PUT - Update file metadata (Phase 3)
async function updateFile(request, { params }) {
  try {
    // Await params before accessing properties (Next.js 15 requirement)
    const resolvedParams = await params;
    const fileId = parseInt(resolvedParams.id);
    
    if (isNaN(fileId)) {
      return NextResponse.json(
        { error: 'Invalid file ID' },
        { status: 400 }
      );
    }

    const fileData = await request.json();

    // Check if file exists
    const existingFile = await filesOps.getById(fileId);
    if (!existingFile) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Update the file metadata
    await filesOps.update(fileId, fileData);

    return NextResponse.json({ 
      success: true, 
      message: 'File updated successfully' 
    });
  } catch (error) {
    console.error('Error updating file:', error);
    return NextResponse.json(
      { error: 'Failed to update file' },
      { status: 500 }
    );
  }
}

// DELETE - Delete file
async function deleteFile(request, { params }) {
  try {
    // Await params before accessing properties (Next.js 15 requirement)
    const resolvedParams = await params;
    const fileId = parseInt(resolvedParams.id);
    
    if (isNaN(fileId)) {
      return NextResponse.json(
        { error: 'Invalid file ID' },
        { status: 400 }
      );
    }

    // Check if file exists
    const existingFile = await filesOps.getById(fileId);
    if (!existingFile) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    try {
      // Delete from Vercel Blob storage
      if (existingFile.blob_url) {
        await del(existingFile.blob_url);
        console.log('File deleted from Vercel Blob:', existingFile.blob_url);
      }
    } catch (blobError) {
      console.warn('Failed to delete from Vercel Blob (file may already be deleted):', blobError);
      // Continue with database deletion even if blob deletion fails
    }

    // Delete from database (soft delete)
    await filesOps.delete(fileId);

    return NextResponse.json({ 
      success: true, 
      message: 'File deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}

// Export secured routes
export const GET = withSecureAuth(getFile);
export const PUT = withSecureAuth(updateFile);
export const DELETE = withSecureAuth(deleteFile);

