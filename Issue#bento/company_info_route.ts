// Minimal test - with imports from company-info
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
import { withSecureAuth } from '../../../../../lib/secure-jwt';
import { companyInfoOps, companyValuesOps, whyChooseUsOps } from '../../../../../lib/database';
import { sanitizeInput, validateInput } from '../../../../../lib/security-utils';
import type { CompanyInfo, CompanyValue, WhyChooseUs } from '../../../../../types/database';

// Define the expected signature for a Next.js App Router API Handler.
// This helps ensure type safety and provides clarity.
type AppRouteHandlerFn = (
  req: NextRequest,
  context: { params: Promise<string> }
) => Promise<NextResponse | Response>;

async function getHandler(
  _request: NextRequest,
  _context: { params: Promise<string> }
): Promise<NextResponse> {
  try {
    const companyInfo = await companyInfoOps.get();
    const companyValues = await companyValuesOps.getAll();
    const whyChooseUs = await whyChooseUsOps.getAll();

    return NextResponse.json({ companyInfo, companyValues, whyChooseUs });
  } catch (error: unknown) {
    console.error('Error fetching company info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch company information' },
      { status: 500 }
    );
  }
}

async function putHandler(
  request: NextRequest,
  _context: { params: Promise<string> }
): Promise<NextResponse> {
  try {
    const { companyInfo, companyValues, whyChooseUs }: {
      companyInfo: Partial<CompanyInfo>,
      companyValues: Partial<CompanyValue>[],
      whyChooseUs: Partial<WhyChooseUs>[]
    } = await request.json();

    // Update company info
    if (companyInfo) {
      const sanitizedCompanyInfo = {
        company_name: sanitizeInput.text(companyInfo.company_name),
        slogan: sanitizeInput.text(companyInfo.slogan),
        description: sanitizeInput.text(companyInfo.description),
        mission: sanitizeInput.text(companyInfo.mission),
        total_experience: companyInfo.total_experience,
        students_trained_count: companyInfo.students_trained_count,
        established_year: companyInfo.established_year,
        total_courses: companyInfo.total_courses,
        phone: sanitizeInput.phone(companyInfo.phone),
        email: sanitizeInput.email(companyInfo.email),
        location: sanitizeInput.text(companyInfo.location),
        business_hours: sanitizeInput.text(companyInfo.business_hours),
        response_time: sanitizeInput.text(companyInfo.response_time),
        service_area: sanitizeInput.text(companyInfo.service_area),
        emergency_availability: sanitizeInput.text(companyInfo.emergency_availability),
      };

      const validationResult = validateInput.companyInfo(sanitizedCompanyInfo);
      if (!validationResult.success) {
        return NextResponse.json(
          { error: `Company Info: ${validationResult.error}` },
          { status: 400 }
        );
      }
      await companyInfoOps.upsert(validationResult.data);
    }

    // Update company values
    if (companyValues && Array.isArray(companyValues)) {
      for (const value of companyValues) {
        const sanitizedValue = {
          title: sanitizeInput.text(value.title),
          description: sanitizeInput.text(value.description),
          icon: sanitizeInput.text(value.icon),
          display_order: value.display_order,
        };
        const validationResult = validateInput.companyValue(sanitizedValue);
        if (!validationResult.success) {
          return NextResponse.json(
            { error: `Company Value: ${validationResult.error}` },
            { status: 400 }
          );
        }
        if (value.id) {
          await companyValuesOps.update(value.id, validationResult.data);
        }
      }
    }

    // Update why choose us items
    if (whyChooseUs && Array.isArray(whyChooseUs)) {
      for (const item of whyChooseUs) {
        const sanitizedItem = {
          point: sanitizeInput.text(item.point),
          display_order: item.display_order,
          image_url: sanitizeInput.text(item.image_url),
          image_alt: sanitizeInput.text(item.image_alt),
        };
        const validationResult = validateInput.whyChooseUs(sanitizedItem);
        if (!validationResult.success) {
          return NextResponse.json(
            { error: `Why Choose Us: ${validationResult.error}` },
            { status: 400 }
          );
        }
        if (item.id) {
          await whyChooseUsOps.update(item.id, validationResult.data);
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: '✓ Company information updated successfully' 
    });
  } catch (error: unknown) {
    console.error('Error updating company info:', error);
    return NextResponse.json(
      { error: 'Failed to update company information' },
      { status: 500 }
    );
  }
}

export const GET: AppRouteHandlerFn = getHandler;
export const PUT: AppRouteHandlerFn = withSecureAuth(putHandler);
