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

// GET - Get all courses for admin management
export async function GET(request) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const courses = await coursesOps.getAll();
    
    // Get features for each course
    const coursesWithFeatures = await Promise.all(
      courses.map(async (course) => {
        const features = await courseFeaturesOps.getByCourseId(course.id);
        return {
          ...course,
          features: features.map((f) => f.feature)
        };
      })
    );

    return NextResponse.json({
      courses: coursesWithFeatures
    });
  } catch (error) {
    console.error('Error fetching courses for admin:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

// POST - Create new course
export async function POST(request) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
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

    // Create the course
    const result = await coursesOps.create(courseData);
    const courseId = result.id;

    // Add features if provided
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
      message: 'Course created successfully',
      courseId 
    });
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    );
  }
}

