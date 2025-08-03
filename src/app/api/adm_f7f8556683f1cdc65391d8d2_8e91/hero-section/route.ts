/*
 * Karma Industrial Safety Training Website
 * Written and developed by Gabriel Lacroix for Evergreen Web Solutions
 *
 * File: src/app/api/adm_f7f8556683f1cdc65391d8d2_8e91/hero-section/route.ts
 * Description: API routes for fetching and updating hero section content, statistics, and features.
 * Dependencies: Next.js, Vercel Postgres, secure-jwt, rate-limiter
 * Created: 2025-07-17
 * Last Modified: 2025-08-03
 * Version: 1.0.3
 */
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
    const [heroSection, heroStats, heroFeatures] = await Promise.all([
      heroSectionOps.get(),
      heroStatsOps.getAll(),
      heroFeaturesOps.getAll(),
    ]);

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
export const GET: AppRouteHandlerFn = withSecureAuth(getHeroSection);
export const PUT: AppRouteHandlerFn = withSecureAuth(updateHeroSection);
export const dynamic = 'force-dynamic'; // Ensure this route is always fresh
export const revalidate = 0; // Disable revalidation for this route 
export const runtime = 'nodejs'; // Use nodejs runtime for database operations



//   ___________       *Written and developed by Gabriel Lacroix*               __      ___.
//   \_   _____/__  __ ___________  ___________   ____   ____   ____   /  \    /  \ ____\_ |__  
//    |    __)_\  \/ // __ \_  __ \/ ___\_  __ \_/ __ \_/ __ \ /    \  \   \/\/   // __ \| __ \ 
//    |        \\   /\  ___/|  | \/ /_/  >  | \/\  ___/\  ___/|   |  \  \        /\  ___/| \_\ \
//   /_______  / \_/  \___  >__|  \___  /|__|    \___  >\___  >___|  /   \__/\  /  \___  >___  /
//           \/           \/     /_____/             \/     \/     \/         \/       \/    \/ 
//                     _________      .__          __  .__                                      
//                    /   _____/ ____ |  |  __ ___/  |_|__| ____   ____   ______                
//                    \_____  \ /  _ \|  | |  |  \   __\  |/  _ \ /    \ /  ___/                
//                    /        (  <_> )  |_|  |  /|  | |  (  <_> )   |  \\___ \                 
//                   /_______  /\____/|____/____/ |__| |__|\____/|___|  /____  >                
//                           \/ https://www.evergreenwebsolutions.ca  \/     \/                 