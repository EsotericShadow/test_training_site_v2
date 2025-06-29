import { NextResponse } from 'next/server';
import { withSecureAuth } from '../../../../../lib/secure-jwt';
import { coursesOps, courseFeaturesOps } from '../../../../../lib/database';
import { sanitizeInput, validateInput } from '../../../../../lib/security-utils';
import { validateToken } from '../../../../../lib/csrf';

// GET - Get all courses for admin management
async function getAllCourses() {
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
async function createCourse(request) {
  try {
    const adminToken = request.cookies.get('admin_token')?.value;
    const csrfToken = request.headers.get('x-csrf-token');

    if (!validateToken(adminToken, csrfToken)) {
      return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
    }

    const { features, ...courseData } = await request.json();

    // Sanitize input
    const sanitizedCourseData = {
      title: sanitizeInput.text(courseData.title),
      description: sanitizeInput.text(courseData.description),
      duration: sanitizeInput.text(courseData.duration),
      audience: sanitizeInput.text(courseData.audience),
      slug: sanitizeInput.text(courseData.slug),
      image_url: sanitizeInput.text(courseData.image_url),
      image_alt: sanitizeInput.text(courseData.image_alt),
      category_id: courseData.category_id, // Assuming category_id is an integer, validate below
      popular: courseData.popular // Assuming boolean, validate below
    };

    // Validate input
    const validationResult = validateInput.course(sanitizedCourseData);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error },
        { status: 400 }
      );
    }

    // Ensure category_id is a valid integer if provided
    if (sanitizedCourseData.category_id && !Number.isInteger(sanitizedCourseData.category_id)) {
      return NextResponse.json(
        { error: 'Invalid category_id' },
        { status: 400 }
      );
    }

    // Create the course
    const result = await coursesOps.create(sanitizedCourseData);
    const courseId = result.id;

    // Add features if provided
    if (features && Array.isArray(features) && features.length > 0) {
      for (let i = 0; i < features.length; i++) {
        const feature = sanitizeInput.text(features[i].trim()); // Sanitize feature text
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

// Export secured routes
export const GET = withSecureAuth(getAllCourses);
export const POST = withSecureAuth(createCourse);

