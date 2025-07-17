import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
import { coursesOps, courseFeaturesOps } from '../../../../../lib/database';
import type { CourseFeature } from '../../../../../types/database';

export async function GET(
  _request: NextRequest, 
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { error: 'Course slug is required' },
        { status: 400 }
      );
    }

    const course = await coursesOps.getBySlug(slug);

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' }, 
        { status: 404 }
      );
    }

    const features = await courseFeaturesOps.getByCourseId(course.id);

    const enrichedCourse = {
      ...course,
      features: features.map((feature: CourseFeature) => ({
        feature: feature.feature,
        display_order: feature.display_order || 0
      })).sort((a, b) => a.display_order - b.display_order),
      category: {
        name: course.category_name || 'Uncategorized'
      }
    };

    return NextResponse.json({
      course: enrichedCourse
    });
  } catch (error) {
    const resolvedParams = await params;
    console.error(`Error fetching course with slug ${resolvedParams.slug}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch course' }, 
      { status: 500 }
    );
  }
}
