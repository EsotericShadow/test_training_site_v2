import { NextResponse } from 'next/server';
import { withSecureAuth } from '../../../../../lib/secure-jwt';
import { testimonialsOps } from '../../../../../lib/database';

// GET - Get all testimonials for admin management
async function getAllTestimonials() {
  try {
    const testimonials = await testimonialsOps.getAll();
    return NextResponse.json({
      testimonials,
    });
  } catch (error) {
    console.error('Error fetching testimonials for admin:', error);
    return NextResponse.json(
      { error: 'Failed to fetch testimonials' },
      { status: 500 }
    );
  }
}

// POST - Create new testimonial
async function createTestimonial(request) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.client_name || !data.client_role || !data.company || !data.content) {
      return NextResponse.json(
        { error: 'Missing required fields: client_name, client_role, company, content' },
        { status: 400 }
      );
    }

    // Create the testimonial
    const result = await testimonialsOps.create(data);
    const testimonialId = result.id;

    return NextResponse.json({
      success: true,
      message: '✓ Testimonial created successfully',
      testimonialId,
    });
  } catch (error) {
    console.error('Error creating testimonial:', error);
    return NextResponse.json(
      { error: 'Failed to create testimonial' },
      { status: 500 }
    );
  }
}

// Export secured routes
export const GET = withSecureAuth(getAllTestimonials);
export const POST = withSecureAuth(createTestimonial);

