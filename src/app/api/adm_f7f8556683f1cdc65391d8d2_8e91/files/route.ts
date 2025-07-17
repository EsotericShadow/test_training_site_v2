import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
import { withSecureAuth } from '../../../../../lib/secure-jwt';
import { filesOps } from '../../../../../lib/database';

// Define the expected signature for a Next.js App Router API Handler.
type AppRouteHandlerFn = (
  req: NextRequest,
  context: { params: Promise<string> }
) => Promise<NextResponse>;

// GET - Get all files for admin management
async function getAllFiles(
  _request: NextRequest,
  _context: { params: unknown }
): Promise<NextResponse> {
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
export const GET: AppRouteHandlerFn = withSecureAuth(getAllFiles);