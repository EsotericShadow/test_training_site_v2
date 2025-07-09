import { NextResponse } from 'next/server';
import { coursesOps, courseFeaturesOps } from '../../../../../lib/database';

export async function GET(request, { params }) {
  try {
    // Fix 1: Await params for Next.js 15 compatibility
    const resolvedParams = await params;
    const { slug } = resolvedParams;

    if (!slug) {
      return NextResponse.json(
        { error: 'Course slug is required' },
        { status: 400 }
      );
    }

    // Get course by slug (already includes category_name via JOIN)
    const course = await coursesOps.getBySlug(slug);

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' }, 
        { status: 404 }
      );
    }

    // Get course features
    const features = await courseFeaturesOps.getByCourseId(course.id);

    // Fix 4: Use category_name from the JOIN instead of extra DB call
    const enrichedCourse = {
      ...course,
      features: features.map((feature) => ({
        feature: feature.feature,
        display_order: feature.display_order || 0
      })).sort((a, b) => a.display_order - b.display_order),
      category: {
        name: course.category_name || 'Uncategorized'
      }
    };

    // Fix 2: Wrap response in 'course' property to match expected format
    return NextResponse.json({
      course: enrichedCourse
    });
  } catch (error) {
    console.error(`Error fetching course with slug ${slug}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch course' }, 
      { status: 500 }
    );
  }
}