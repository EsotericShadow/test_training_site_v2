import { NextResponse } from 'next/server';
import { withSecureAuth } from '../../../../../lib/secure-jwt';
import { companyInfoOps, companyValuesOps, whyChooseUsOps } from '../../../../../lib/database';

// GET - Get company info for editing
async function getCompanyInfo() {
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
    console.error('Error fetching company info for admin:', error);
    return NextResponse.json(
      { error: 'Failed to fetch company information' },
      { status: 500 }
    );
  }
}

// PUT - Update company info
async function updateCompanyInfo(request) {
  try {
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

// Export secured routes
export const GET = withSecureAuth(getCompanyInfo);
export const PUT = withSecureAuth(updateCompanyInfo);

