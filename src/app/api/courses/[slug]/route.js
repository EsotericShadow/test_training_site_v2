import { NextResponse } from 'next/server';
import { coursesOps, courseFeaturesOps, courseCategoriesOps } from '../../../../../lib/database';

export async function GET(request, { params }) {
  try {
    // Await params before using its properties (Next.js 15 requirement)
    const resolvedParams = await params;
    const { slug } = resolvedParams;
    
    if (!slug) {
      return NextResponse.json(
        { error: 'Course slug is required' },
        { status: 400 }
      );
    }

    // Get course by slug
    const course = await coursesOps.getBySlug(slug);
    
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Get course features
    const features = await courseFeaturesOps.getByCourseId(course.id);
    
    // Get category information
    let category = null;
    if (course.category_id) {
      const categories = await courseCategoriesOps.getAll();
      category = categories.find(cat => cat.id === course.category_id);
    }

    // Return enriched course data
    return NextResponse.json({
      course: {
        ...course,
        features: features.map((f) => ({
          feature: f.feature,
          display_order: f.display_order
        })).sort((a, b) => a.display_order - b.display_order),
        category: category || { name: 'General Training' }
      }
    });
  } catch (error) {
    console.error('Error fetching course by slug:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course' },
      { status: 500 }
    );
  }
}

