// src/app/adm_f7f8556683f1cdc65391d8d2_8e91/courses/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
import { withSecureAuth, AuthResult } from '../../../../../../lib/secure-jwt';
import { coursesOps, courseFeaturesOps } from '../../../../../../lib/database';
import type { Course, CourseFeature } from '../../../../../../types/database';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
  auth: AuthResult;
}

// GET - Get specific course for editing
async function getCourse(_request: NextRequest, context: RouteContext): Promise<NextResponse> {
  try {
    const params = await context.params;
    const courseId = parseInt(params.id, 10);
    
    if (isNaN(courseId)) {
      return NextResponse.json({ error: 'Invalid course ID' }, { status: 400 });
    }

    const course = await coursesOps.getById(courseId);
    
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const features = await courseFeaturesOps.getByCourseId(courseId);
    
    return NextResponse.json({
      course: {
        ...course,
        features: features.map((f: CourseFeature) => f.feature)
      }
    });
  } catch (error: unknown) {
    console.error('Error fetching course:', error);
    return NextResponse.json({ error: 'Failed to fetch course' }, { status: 500 });
  }
}

// PUT - Update course
async function updateCourse(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  try {
    const params = await context.params;
    const courseId = parseInt(params.id, 10);
    
    if (isNaN(courseId)) {
      return NextResponse.json({ error: 'Invalid course ID' }, { status: 400 });
    }

    const { features, ...courseData }: { features: string[] } & Partial<Course> = await request.json();

    if (!courseData.title || !courseData.description || !courseData.duration || !courseData.audience || !courseData.what_youll_learn) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, what_youll_learn, duration, audience' },
        { status: 400 }
      );
    }

    const existingCourse = await coursesOps.getById(courseId);
    if (!existingCourse) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    await coursesOps.update(courseId, courseData);

    await courseFeaturesOps.deleteByCourseId(courseId);
    
    if (features && Array.isArray(features) && features.length > 0) {
      for (let i = 0; i < features.length; i++) {
        const featureStr = features[i];
        const feature = featureStr ? featureStr.trim() : '';
        if (feature) {
          await courseFeaturesOps.create(courseId, feature, i);
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Course updated successfully' 
    });
  } catch (error: unknown) {
    console.error('Error updating course:', error);
    return NextResponse.json({ error: 'Failed to update course' }, { status: 500 });
  }
}

// DELETE - Delete course
async function deleteCourse(_request: NextRequest, context: RouteContext): Promise<NextResponse> {
  try {
    const params = await context.params;
    const courseId = parseInt(params.id, 10);
    
    if (isNaN(courseId)) {
      return NextResponse.json({ error: 'Invalid course ID' }, { status: 400 });
    }

    const existingCourse = await coursesOps.getById(courseId);
    if (!existingCourse) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    await courseFeaturesOps.deleteByCourseId(courseId);
    await coursesOps.delete(courseId);

    return NextResponse.json({ 
      success: true, 
      message: 'Course deleted successfully' 
    });
  } catch (error: unknown) {
    console.error('Error deleting course:', error);
    return NextResponse.json({ error: 'Failed to delete course' }, { status: 500 });
  }
}

export const GET = withSecureAuth(getCourse);
export const PUT = withSecureAuth(updateCourse);
export const DELETE = withSecureAuth(deleteCourse);
