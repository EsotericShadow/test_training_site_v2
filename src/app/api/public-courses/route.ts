/*
 * Karma Industrial Safety Training Website
 * Written and developed by Gabriel Lacroix for Evergreen Web Solutions
 *
 * File: src/app/api/public-courses/route.ts
 * Description: Public API route for fetching all courses.
 * Dependencies: Next.js, Vercel Postgres
 * Created: August 3, 2025
 * Last Modified: August 3, 2025
 * Version: 1.0.0
 */
import { NextResponse } from 'next/server';
import { coursesOps } from '../../../../lib/database';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const courses = await coursesOps.getAllWithDetails();
    return NextResponse.json({ courses });
  } catch (error) {
    console.error('Error fetching public courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}
