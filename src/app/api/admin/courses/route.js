import { NextResponse } from 'next/server';
import { coursesOps, courseFeaturesOps } from '../../../../../lib/database';

// GET - Get all courses for admin management
export async function GET() {
  try {
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