import { NextResponse } from 'next/server';
import { courseCategoriesOps } from '../../../../../lib/database';

// GET - Get all categories
export async function GET() {
  try {
    const categories = await courseCategoriesOps.getAll();
    
    return NextResponse.json({
      categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST - Create new category
export async function POST(request) {
  try {
    const categoryData = await request.json();

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
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}