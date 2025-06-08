import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { teamMembersOps, adminSessionsOps } from '../../../../../lib/database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// GET - Get all team members for admin management
export async function GET(request) {
  try {
    const token = request.cookies.get('admin_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify JWT token
    try {
      jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Check if session exists in database
    const session = await adminSessionsOps.getByToken(token);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 401 }
      );
    }

    const teamMembers = await teamMembersOps.getAll();
    return NextResponse.json({ teamMembers });
  } catch (error) {
    console.error('Error fetching team members for admin:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team members' },
      { status: 500 }
    );
  }
}

