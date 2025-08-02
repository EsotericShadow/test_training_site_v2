// src/app/api/courses/route.ts
import { NextResponse } from 'next/server';
import { coursesOps } from '../../../../lib/database';

export async function GET() {
  try {
    const courses = await coursesOps.getAllWithDetails();
    return NextResponse.json({ courses });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}
