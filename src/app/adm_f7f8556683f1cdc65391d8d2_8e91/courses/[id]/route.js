import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { coursesOps, courseFeaturesOps, adminSessionsOps } from '../../../../../lib/database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Helper function to verify authentication
async function verifyAuth(request) {
  try {
    const token = request.cookies.get('admin_token')?.value;

    if (!token) {
      return { error: 'Not authenticated', status: 401 };
    }

    // Verify JWT token
    try {
      jwt.verify(token, JWT_SECRET);
    } catch {
      return { error: 'Invalid token', status: 401 };
    }

    // Check if session exists in database
    const session = await adminSessionsOps.getByToken(token);
    
    if (!session) {
      return { error: 'Session not found', status: 401 };
    }

    return { authenticated: true, session };
  } catch (error) {
    console.error('Auth verification error:', error);
    return { error: 'Internal server error', status: 500 };
  }
}

// GET - Get specific course for editing
export async function GET(request, { params }) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    // Await params before accessing properties (Next.js 15 requirement)
    const resolvedParams = await params;
    const courseId = parseInt(resolvedParams.id);
    
    if (isNaN(courseId)) {
      return NextResponse.json(
        { error: 'Invalid course ID' },
        { status: 400 }
      );
    }

    const course = await coursesOps.getById(courseId);
    
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Get course features
    const features = await courseFeaturesOps.getByCourseId(courseId);
    
    return NextResponse.json({
      course: {
        ...course,
        features: features.map((f) => f.feature)
      }
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course' },
      { status: 500 }
    );
  }
}

// PUT - Update course
export async function PUT(request, { params }) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    // Await params before accessing properties (Next.js 15 requirement)
    const resolvedParams = await params;
    const courseId = parseInt(resolvedParams.id);
    
    if (isNaN(courseId)) {
      return NextResponse.json(
        { error: 'Invalid course ID' },
        { status: 400 }
      );
    }

    const { features, ...courseData } = await request.json();

    // Validate required fields
    if (!courseData.title || !courseData.description || !courseData.duration || !courseData.audience) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, duration, audience' },
        { status: 400 }
      );
    }

    // Check if course exists
    const existingCourse = await coursesOps.getById(courseId);
    if (!existingCourse) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Update the course
    await coursesOps.update(courseId, courseData);

    // Update features - delete all existing and recreate
    await courseFeaturesOps.deleteByCourseId(courseId);
    
    if (features && Array.isArray(features) && features.length > 0) {
      for (let i = 0; i < features.length; i++) {
        const feature = features[i].trim();
        if (feature) {
          await courseFeaturesOps.create(courseId, feature, i);
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Course updated successfully' 
    });
  } catch (error) {
    console.error('Error updating course:', error);
    return NextResponse.json(
      { error: 'Failed to update course' },
      { status: 500 }
    );
  }
}

// DELETE - Delete course
export async function DELETE(request, { params }) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    // Await params before accessing properties (Next.js 15 requirement)
    const resolvedParams = await params;
    const courseId = parseInt(resolvedParams.id);
    
    if (isNaN(courseId)) {
      return NextResponse.json(
        { error: 'Invalid course ID' },
        { status: 400 }
      );
    }

    // Check if course exists
    const existingCourse = await coursesOps.getById(courseId);
    if (!existingCourse) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Delete course features first (foreign key constraint)
    await courseFeaturesOps.deleteByCourseId(courseId);
    
    // Delete the course
    await coursesOps.delete(courseId);

    return NextResponse.json({ 
      success: true, 
      message: 'Course deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json(
      { error: 'Failed to delete course' },
      { status: 500 }
    );
  }
}

