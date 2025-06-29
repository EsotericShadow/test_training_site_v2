import { NextResponse } from 'next/server';
import { coursesOps, courseFeaturesOps, courseCategoriesOps } from '../../../../../lib/database';

export async function GET(request, { params }) {
  const { slug } = params;

  try {
    const course = await coursesOps.getBySlug(slug);

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const features = await courseFeaturesOps.getByCourseId(course.id);
    const category = await courseCategoriesOps.getById(course.category_id);

    const enrichedCourse = {
      ...course,
      features: features.map((feature) => ({
        feature: feature.feature,
        display_order: feature.display_order
      })).sort((a, b) => a.display_order - b.display_order),
      category: category || { name: 'Uncategorized' }
    };

    return NextResponse.json(enrichedCourse);
  } catch (error) {
    console.error(`Error fetching course with slug ${slug}:`, error);
    return NextResponse.json({ error: 'Failed to fetch course' }, { status: 500 });
  }
}

