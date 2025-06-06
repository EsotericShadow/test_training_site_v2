import { NextResponse } from 'next/server';
import { testimonialsOps } from '../../../../lib/database';

export async function GET() {
  try {
    const testimonials = await testimonialsOps.getAll();

    const response = testimonials.map(testimonial => ({
      id: testimonial.id.toString(),
      clientName: testimonial.client_name,
      clientRole: testimonial.client_role,
      company: testimonial.company,
      industry: testimonial.industry,
      content: testimonial.content,
      rating: testimonial.rating,
      clientPhoto: testimonial.client_photo_url,
      featured: Boolean(testimonial.featured)
    }));

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return NextResponse.json(
      { error: 'Failed to fetch testimonials' },
      { status: 500 }
    );
  }
}