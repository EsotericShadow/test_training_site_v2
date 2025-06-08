import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { testimonialsOps, adminSessionsOps } from '../../../../../lib/database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// GET - Get all testimonials for admin management
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

    const testimonials = await testimonialsOps.getAll();
    return NextResponse.json({
      testimonials,
    });
  } catch (error) {
    console.error('Error fetching testimonials for admin:', error);
    return NextResponse.json(
      { error: 'Failed to fetch testimonials' },
      { status: 500 }
    );
  }
}

// POST - Create new testimonial (ADMIN ONLY)
export async function POST(request) {
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

    const data = await request.json();

    // Validate required fields
    if (!data.client_name || !data.client_role || !data.company || !data.content) {
      return NextResponse.json(
        { error: 'Missing required fields: client_name, client_role, company, content' },
        { status: 400 }
      );
    }

    // Create the testimonial
    const result = await testimonialsOps.create(data);
    const testimonialId = result.id;

    return NextResponse.json({
      success: true,
      message: '✓ Testimonial created successfully',
      testimonialId,
    });
  } catch (error) {
    console.error('Error creating testimonial:', error);
    return NextResponse.json(
      { error: 'Failed to create testimonial' },
      { status: 500 }
    );
  }
}

