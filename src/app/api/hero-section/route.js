import { NextResponse } from 'next/server';
import { heroSectionOps, heroStatsOps, heroFeaturesOps, adminSessionsOps } from '../../../../lib/database';

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

// PUT - Secure update for admin only
export async function PUT(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized: Missing or invalid token' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const session = await adminSessionsOps.getByToken(token);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid or expired token' },
        { status: 401 }
      );
    }

    const { heroSection, heroStats, heroFeatures } = await request.json();
    if (heroSection) {
      await heroSectionOps.upsert(heroSection);
    }
    if (heroStats && Array.isArray(heroStats)) {
      for (const stat of heroStats) {
        if (stat.id) {
          await heroStatsOps.update(stat.id, stat);
        }
      }
    }
    if (heroFeatures && Array.isArray(heroFeatures)) {
      for (const feature of heroFeatures) {
        if (feature.id) {
          await heroFeaturesOps.update(feature.id, feature);
        }
      }
    }
    return NextResponse.json({ 
      success: true, 
      message: '✓ Hero section updated successfully' 
    });
  } catch (error) {
    console.error('Error updating hero section:', error);
    return NextResponse.json(
      { error: 'Failed to update hero section' },
      { status: 500 }
    );
  }
}