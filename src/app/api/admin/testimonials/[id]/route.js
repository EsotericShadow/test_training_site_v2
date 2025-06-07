import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { testimonialsOps, adminSessionsOps } from '../../../../../../lib/database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Helper function to verify authentication
async function verifyAuth(request) {
  const token = request.cookies.get('admin_token')?.value;

  if (!token) {
    return { error: 'Not authenticated', status: 401 };
  }

  try {
    jwt.verify(token, JWT_SECRET);
  } catch {
    return { error: 'Invalid token', status: 401 };
  }

  const session = await adminSessionsOps.getByToken(token);
  
  if (!session) {
    return { error: 'Session not found', status: 401 };
  }

  return { success: true };
}

// GET - Get testimonial by ID
export async function GET(request, { params }) {
  try {
    const authResult = await verifyAuth(request);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const testimonial = await testimonialsOps.getById(params.id);
    if (!testimonial) {
      return NextResponse.json(
        { error: 'Testimonial not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(testimonial);
  } catch (error) {
    console.error('Error fetching testimonial:', error);
    return NextResponse.json(
      { error: 'Failed to fetch testimonial' },
      { status: 500 }
    );
  }
}

// PUT - Update testimonial
export async function PUT(request, { params }) {
  try {
    const authResult = await verifyAuth(request);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
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

    // Check if testimonial exists
    const existing = await testimonialsOps.getById(params.id);
    if (!existing) {
      return NextResponse.json(
        { error: 'Testimonial not found' },
        { status: 404 }
      );
    }

    // Update the testimonial
    await testimonialsOps.update(params.id, data);

    return NextResponse.json({
      success: true,
      message: '✓ Testimonial updated successfully',
    });
  } catch (error) {
    console.error('Error updating testimonial:', error);
    return NextResponse.json(
      { error: 'Failed to update testimonial' },
      { status: 500 }
    );
  }
}

// DELETE - Delete testimonial
export async function DELETE(request, { params }) {
  try {
    const authResult = await verifyAuth(request);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    // Check if testimonial exists
    const existing = await testimonialsOps.getById(params.id);
    if (!existing) {
      return NextResponse.json(
        { error: 'Testimonial not found' },
        { status: 404 }
      );
    }

    // Delete the testimonial
    await testimonialsOps.delete(params.id);

    return NextResponse.json({
      success: true,
      message: '✓ Testimonial deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    return NextResponse.json(
      { error: 'Failed to delete testimonial' },
      { status: 500 }
    );
  }
}

