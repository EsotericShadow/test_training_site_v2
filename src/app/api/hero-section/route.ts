// src/app/api/hero-section/route.ts
import { NextResponse } from 'next/server';
import { heroSectionOps, heroStatsOps, heroFeaturesOps } from '../../../../lib/database';

export async function GET() {
  try {
    const [heroSection, heroStats, heroFeatures] = await Promise.all([
      heroSectionOps.get(),
      heroStatsOps.getAll(),
      heroFeaturesOps.getAll(),
    ]);

    return NextResponse.json({ heroSection, heroStats, heroFeatures });
  } catch (error) {
    console.error('Error fetching hero data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hero data' },
      { status: 500 }
    );
  }
}
