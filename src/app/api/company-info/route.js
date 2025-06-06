import { NextResponse } from 'next/server';
import { companyInfoOps, companyValuesOps, whyChooseUsOps } from '../../../../lib/database';

export async function GET() {
  try {
    const [companyInfo, coreValues, whyChooseUs] = await Promise.all([
      companyInfoOps.get(),
      companyValuesOps.getAll(),
      whyChooseUsOps.getAll()
    ]);

    // If no company info exists, return default data
    if (!companyInfo) {
      return NextResponse.json({
        companyName: 'Karma Training',
        slogan: 'We believe the choices you make today will define your tomorrow',
        description: 'Karma Training is Northwestern British Columbia\'s premier provider of workplace safety training.',
        mission: 'Our expert instructors bring real-world experience and deep knowledge of safety regulations.',
        totalExperience: 70,
        studentsTrainedCount: 2000,
        establishedYear: 2017,
        totalCourses: 14,
        coreValues: [],
        whyChooseUs: []
      });
    }

    // Parse specializations if they exist
    const response = {
      companyName: companyInfo.company_name,
      slogan: companyInfo.slogan,
      description: companyInfo.description,
      mission: companyInfo.mission,
      totalExperience: companyInfo.total_experience,
      studentsTrainedCount: companyInfo.students_trained_count,
      establishedYear: companyInfo.established_year,
      totalCourses: companyInfo.total_courses,
      coreValues: coreValues.map(value => ({
        title: value.title,
        description: value.description,
        icon: value.icon
      })),
      whyChooseUs: whyChooseUs.map(item => ({
        point: item.point
      }))
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching company info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch company information' },
      { status: 500 }
    );
  }
}