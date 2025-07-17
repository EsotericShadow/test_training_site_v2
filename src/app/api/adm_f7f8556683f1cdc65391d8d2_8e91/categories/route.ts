// src/app/api/adm_f7f8556683f1cdc65391d8d2_8e91/categories/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
import { courseCategoriesOps } from '../../../../../lib/database';
import type { CourseCategory } from '../../../../../types/database';

// GET - Get all categories
export async function GET(): Promise<NextResponse> {
  try {
    const categories = await courseCategoriesOps.getAll();
    return NextResponse.json({ categories });
  } catch (error: unknown) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST - Create new category
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const categoryData: Partial<CourseCategory> = await request.json();

    // Validate required fields
    if (!categoryData.name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    const result = await courseCategoriesOps.create(categoryData);

    return NextResponse.json({ 
      success: true, 
      message: 'Category created successfully',
      categoryId: result.id 
    });
  } catch (error: unknown) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}