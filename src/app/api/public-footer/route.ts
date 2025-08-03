/*
 * Karma Industrial Safety Training Website
 * Written and developed by Gabriel Lacroix for Evergreen Web Solutions
 *
 * File: src/app/api/public-footer/route.ts
 * Description: Public API route for fetching footer content and popular courses.
 * Dependencies: Next.js, Vercel Postgres
 * Created: August 3, 2025
 * Last Modified: August 3, 2025
 * Version: 1.0.0
 */
import { NextResponse } from 'next/server';
import { footerContentOps, coursesOps } from '../../../../lib/database';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const footerContent = await footerContentOps.get();
    const allCourses = await coursesOps.getAll();
    const popularCourses = allCourses.filter(course => course.popular).slice(0, 5);

    return NextResponse.json({
      footerContent,
      popularCourses
    });
  } catch (error) {
    console.error('Error fetching public footer data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch footer data' },
      { status: 500 }
    );
  }
}
