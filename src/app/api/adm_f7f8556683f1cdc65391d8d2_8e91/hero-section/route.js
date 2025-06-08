import { NextResponse } from 'next/server';
import { withSecureAuth } from '../../../../../lib/secure-jwt';
import { heroSectionOps, heroStatsOps, heroFeaturesOps } from '../../../../../lib/database';

// GET - Get hero section data for admin editing
async function getHeroSection() {
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
    console.error('Error fetching hero section for admin:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hero section data' },
      { status: 500 }
    );
  }
}

// PUT - Update hero section data
async function updateHeroSection(request) {
  try {
    const { heroSection, heroStats, heroFeatures } = await request.json();

    // Validate hero section data
    if (heroSection) {
      await heroSectionOps.upsert(heroSection);
    }

    // Update hero stats
    if (heroStats && Array.isArray(heroStats)) {
      for (const stat of heroStats) {
        if (stat.id) {
          await heroStatsOps.update(stat.id, stat);
        }
      }
    }

    // Update hero features
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

// Export secured routes
export const GET = withSecureAuth(getHeroSection);
export const PUT = withSecureAuth(updateHeroSection);

