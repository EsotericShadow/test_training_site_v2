import { NextResponse } from 'next/server';
import { heroSectionOps, heroStatsOps, heroFeaturesOps } from '../../../../lib/database';

// GET - Public access to hero section data
export async function GET() {
  try {
    const heroSection = await heroSectionOps.get();
    const heroStats = await heroStatsOps.getAll();
    const heroFeatures = await heroFeaturesOps.getAll();

    return NextResponse.json({
      heroSection,
      heroStats,
      heroFeatures
    });
  } catch (error) {
    console.error('Error fetching hero section:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hero section data' },
      { status: 500 }
    );
  }
}
