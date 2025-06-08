import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { companyInfoOps, companyValuesOps, whyChooseUsOps, adminSessionsOps } from '../../../../../lib/database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// GET - Get company info for editing
export async function GET(request) {
  try {
    const token = request.cookies.get('admin_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify JWT token
    try {
      jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Check if session exists in database
    const session = await adminSessionsOps.getByToken(token);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 401 }
      );
    }

    const companyInfo = await companyInfoOps.get();
    const companyValues = await companyValuesOps.getAll();
    const whyChooseUs = await whyChooseUsOps.getAll();

    return NextResponse.json({
      companyInfo,
      companyValues,
      whyChooseUs
    });
  } catch (error) {
    console.error('Error fetching company info for admin:', error);
    return NextResponse.json(
      { error: 'Failed to fetch company information' },
      { status: 500 }
    );
  }
}

// PUT - Update company info
export async function PUT(request) {
  try {
    const token = request.cookies.get('admin_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify JWT token
    try {
      jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Check if session exists in database
    const session = await adminSessionsOps.getByToken(token);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 401 }
      );
    }

    const { companyInfo, companyValues, whyChooseUs } = await request.json();

    // Update company info
    if (companyInfo) {
      await companyInfoOps.upsert(companyInfo);
    }

    // Update company values
    if (companyValues && Array.isArray(companyValues)) {
      for (const value of companyValues) {
        if (value.id) {
          await companyValuesOps.update(value.id, value);
        }
      }
    }

    // Update why choose us items
    if (whyChooseUs && Array.isArray(whyChooseUs)) {
      for (const item of whyChooseUs) {
        if (item.id) {
          await whyChooseUsOps.update(item.id, item);
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: '✓ Company information updated successfully' 
    });
  } catch (error) {
    console.error('Error updating company info:', error);
    return NextResponse.json(
      { error: 'Failed to update company information' },
      { status: 500 }
    );
  }
}

