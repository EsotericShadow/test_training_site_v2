import { NextResponse, NextRequest } from 'next/server';
import { withSecureAuth } from '../../../../../lib/secure-jwt';
import { 
  heroSectionOps, 
  heroStatsOps, 
  heroFeaturesOps,
  HeroSection,
  HeroStat,
  HeroFeature
} from '../../../../../lib/database';
import { applyRateLimit } from '../../../../../lib/rate-limiter';

// Define the expected signature for a Next.js App Router API Handler.
type AppRouteHandlerFn = (
  req: NextRequest,
  context: { params: Promise<string> }
) => Promise<NextResponse>;

// --- TYPE DEFINITIONS --- 

interface UpdateHeroSectionRequest {
  heroSection?: Partial<HeroSection>;
  heroStats?: (Partial<HeroStat> & { id?: number })[];
  heroFeatures?: (Partial<HeroFeature> & { id?: number })[];
}

// GET - Get hero section data for admin editing
async function getHeroSection(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';
  const rateLimitResult = await applyRateLimit(request, ip, 'public_api');

  if (rateLimitResult.limited) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

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
async function updateHeroSection(
  request: NextRequest,
  _context: { params: unknown }
): Promise<NextResponse> {
  const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';
  const rateLimitResult = await applyRateLimit(request, ip, 'admin_api');

  if (rateLimitResult.limited) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const { heroSection, heroStats, heroFeatures }: UpdateHeroSectionRequest = await request.json();

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

// Export routes
export const GET = getHeroSection;
export const PUT: AppRouteHandlerFn = withSecureAuth(updateHeroSection);
export const dynamic = 'force-dynamic'; // Ensure this route is always fresh
export const revalidate = 0; // Disable revalidation for this route 
export const runtime = 'nodejs'; // Use nodejs runtime for database operations
