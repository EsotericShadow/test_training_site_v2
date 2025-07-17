import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
import { teamMembersOps, companyInfoOps, whyChooseUsOps, companyValuesOps } from '../../../../lib/database';

export async function GET() {
  try {
    const [teamMembers, companyInfo, whyChooseUs, companyValues] = await Promise.all([
      teamMembersOps.getAll(),
      companyInfoOps.get(),
      whyChooseUsOps.getAll(),
      companyValuesOps.getAll(),
    ]);

    const sortedTeamMembers = Array.isArray(teamMembers)
      ? teamMembers
          .filter(member => member.featured)
          .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
          .slice(0, 4)
      : [];

    return NextResponse.json({
      teamMembers: sortedTeamMembers,
      companyInfo,
      whyChooseUs,
      companyValues,
    });
  } catch (error) {
    console.error('Error fetching about snippet data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch about snippet data' },
      { status: 500 }
    );
  }
}
