import { NextResponse } from 'next/server';
import { coursesOps } from '../../../../lib/database';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const getAll = searchParams.get('all') === 'true';

  if (getAll) {
    try {
      const courses = await coursesOps.getAll();
      return NextResponse.json({ courses });
    } catch (error) {
      console.error('Error fetching all courses:', error);
      return NextResponse.json(
        { error: 'Failed to fetch courses' },
        { status: 500 }
      );
    }
  }

  return NextResponse.json(
    { error: 'Missing ?all=true parameter' },
    { status: 400 }
  );
}
