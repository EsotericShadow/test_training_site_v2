import { NextResponse } from 'next/server';
import { withSecureAuth } from '../../../../../../lib/secure-jwt';
import { coursesOps, courseFeaturesOps } from '../../../../../../lib/database';

// GET - Get specific course for editing
async function getCourse(request, { params }) {
  try {
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
async function updateCourse(request, { params }) {
  try {
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
async function deleteCourse(request, { params }) {
  try {
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

// Export secured routes
export const GET = withSecureAuth(getCourse);
export const PUT = withSecureAuth(updateCourse);
export const DELETE = withSecureAuth(deleteCourse);

