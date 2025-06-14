import { NextResponse } from 'next/server';
import { withSecureAuth } from '../../../../../lib/secure-jwt';
import { filesOps } from '../../../../../lib/database';

// GET - Get all files for admin management
async function getAllFiles() {
  try {
    const files = await filesOps.getAll();
    
    return NextResponse.json({
      files: files
    });
  } catch (error) {
    console.error('Error fetching files for admin:', error);
    return NextResponse.json(
      { error: 'Failed to fetch files' },
      { status: 500 }
    );
  }
}

// Export secured routes
export const GET = withSecureAuth(getAllFiles);

