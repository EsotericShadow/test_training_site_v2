import { NextResponse } from 'next/server';
import { coursesOps, courseFeaturesOps, courseCategoriesOps } from '../../../../lib/database';

export async function GET() {
  try {
    const courses = await coursesOps.getAll();
    const courseCategories = await courseCategoriesOps.getAll();

    const enrichedCourses = await Promise.all(courses.map(async (course) => {
      const features = await courseFeaturesOps.getByCourseId(course.id);
      return {
        ...course,
        features: features.map((feature) => ({
          feature: feature.feature,
          display_order: feature.display_order
        })).sort((a, b) => a.display_order - b.display_order),
        category: courseCategories.find((cat) => cat.id === course.category_id) || { name: 'Uncategorized' }
      };
    }));

    return NextResponse.json(enrichedCourses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json([], { status: 500 });
  }
}