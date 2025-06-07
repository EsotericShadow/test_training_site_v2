import { NextResponse } from 'next/server';
import { companyInfoOps, companyValuesOps, whyChooseUsOps } from '../../../../lib/database';

// GET - Get company info for public display
export async function GET() {
  try {
    const companyInfo = await companyInfoOps.get();
    const companyValues = await companyValuesOps.getAll();
    const whyChooseUs = await whyChooseUsOps.getAll();

    return NextResponse.json({
      companyInfo,
      companyValues,
      whyChooseUs
    });
  } catch (error) {
    console.error('Error fetching company info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch company information' },
      { status: 500 }
    );
  }
}

