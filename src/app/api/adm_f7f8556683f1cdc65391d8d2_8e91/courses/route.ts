/*
 * Evergreen Web Solutions
 * Written and developed by Gabriel Lacroix
 *
 * File: route.ts
 * Description: To be filled in with the script's purpose
 * Dependencies: To be filled in with key dependencies or modules
 * Created: August 2, 2025
 * Last Modified: August 2, 2025
 * Version: 1.0.0
 */
// src/app/api/adm_f7f8556683f1cdc65391d8d2_8e91/courses/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
import { withSecureAuth } from '../../../../../lib/secure-jwt';
import { coursesOps, courseFeaturesOps } from '../../../../../lib/database';
import { sanitizeInput, validateInput } from '../../../../../lib/security-utils';
import { validateToken } from '../../../../../lib/csrf';
import { validateSession } from '../../../../../lib/session-manager';
import type { Course } from '../../../../../types/database';

// Define the expected signature for a Next.js App Router API Handler.
type AppRouteHandlerFn = (
  req: NextRequest,
  context: { params: Promise<string> }  // Adjusted type to match the expected context
) => Promise<NextResponse>;



// GET - Get all courses for admin management
async function getAllCourses(): Promise<NextResponse> {
  try {
    const courses = await coursesOps.getAllWithDetails();

    return NextResponse.json({
      courses: courses
    });
  } catch (error: unknown) {
    console.error('Error fetching courses for admin:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

// POST - Create new course
async function createCourse(
  request: NextRequest,
  _context: { params: unknown }
): Promise<NextResponse> {
  try {
    const adminToken = request.cookies.get('admin_token')?.value;
    const csrfToken = request.headers.get('x-csrf-token');
    
    if (!adminToken || !csrfToken) {
        return NextResponse.json({ error: 'Missing token' }, { status: 401 });
    }

    const sessionResult = await validateSession(adminToken, request);

    if (!sessionResult.valid || !sessionResult.session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    if (!validateToken(sessionResult.session.id, csrfToken)) {
      return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
    }

    const { features, ...courseData }: { features: string[] } & Partial<Course> = await request.json();

    const sanitizedCourseData = {
      title: sanitizeInput.text(courseData.title),
      description: sanitizeInput.text(courseData.description),
      duration: sanitizeInput.text(courseData.duration),
      audience: sanitizeInput.text(courseData.audience),
      slug: sanitizeInput.text(courseData.slug),
      image_url: sanitizeInput.text(courseData.image_url),
      image_alt: sanitizeInput.text(courseData.image_alt),
      category_id: courseData.category_id,
      popular: courseData.popular
    };

    const validationResult = validateInput.course(sanitizedCourseData);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error },
        { status: 400 }
      );
    }

    if (sanitizedCourseData.category_id && !Number.isInteger(sanitizedCourseData.category_id)) {
      return NextResponse.json(
        { error: 'Invalid category_id' },
        { status: 400 }
      );
    }

    const result = await coursesOps.create(validationResult.data);
    const courseId = result.id;

    if (courseId && features && Array.isArray(features) && features.length > 0) {
      for (let i = 0; i < features.length; i++) {
        const rawFeature = features[i];
        const feature = rawFeature ? sanitizeInput.text(rawFeature.trim()) : '';
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
  } catch (error: unknown) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    );
  }
}

// Export routes
export const GET = getAllCourses;
export const POST: AppRouteHandlerFn = withSecureAuth(createCourse);


//   ___________       *Written and developed by Gabriel Lacroix*               __      ___.
//   \_   _____/__  __ ___________  ___________   ____   ____   ____   /  \    /  \ ____\_ |__  
//    |    __)_\  \/ // __ \_  __ \/ ___\_  __ \_/ __ \_/ __ \ /    \  \   \/\/   // __ \| __ \ 
//    |        \\   /\  ___/|  | \/ /_/  >  | \/\  ___/\  ___/|   |  \  \        /\  ___/| \_\ \
//   /_______  / \_/  \___  >__|  \___  /|__|    \___  >\___  >___|  /   \__/\  /  \___  >___  /
//           \/           \/     /_____/             \/     \/     \/         \/       \/    \/ 
//                     _________      .__          __  .__                                      
//                    /   _____/ ____ |  |  __ ___/  |_|__| ____   ____   ______                
//                    \_____  \ /  _ \|  | |  |  \   __\  |/  _ \ /    \ /  ___/                
//                    /        (  <_> )  |_|  |  /|  | |  (  <_> )   |  \\___ \                 
//                   /_______  /\____/|____/____/ |__| |__|\____/|___|  /____  >                
//                           \/ https://www.evergreenwebsolutions.ca  \/     \/                 