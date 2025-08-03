/*
 * Evergreen Web Solutions
 * Written and developed by Gabriel Lacroix
 *
 * File: route.ts
 * Description: To be filled in with the script's purpose
 * Dependencies: To be filled in with key dependencies or modules
 * Created: August 2, 2025
 * Last Modified: August 2, 2025
 * Version: 1.0.0
 */
import { NextResponse, NextRequest } from 'next/server';

export const runtime = 'nodejs';
import { withSecureAuth } from '../../../../../lib/secure-jwt';
import { 
  footerContentOps, 
  footerStatsOps, 
  footerQuickLinksOps, 
  footerCertificationsOps, 
  footerBottomBadgesOps,
  coursesOps,
  FooterContent,
  FooterStat,
  FooterQuickLink,
  FooterCertification,
  FooterBottomBadge,
  Course
} from '../../../../../lib/database';
import { sanitizeInput, validateInput } from '../../../../../lib/security-utils';

// Define the expected signature for a Next.js App Router API Handler.
type AppRouteHandlerFn = (
  req: NextRequest,
  context: { params: Promise<string> }
) => Promise<NextResponse>;

interface UpdateFooterDataRequest {
  footerContent?: Partial<FooterContent>;
  footerStats?: (Partial<FooterStat> & { id?: number })[];
  footerQuickLinks?: (Partial<FooterQuickLink> & { id?: number })[];
  footerCertifications?: (Partial<FooterCertification> & { id?: number })[];
  footerBottomBadges?: (Partial<FooterBottomBadge> & { id?: number })[];
}

// GET - Get footer data for admin editing
async function getFooterData(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const isAdmin = searchParams.get('admin') === 'true';

  try {
    const footerContent = await footerContentOps.get();
    const footerStats = await footerStatsOps.getAll();
    const footerQuickLinks = isAdmin ? await footerQuickLinksOps.getAllIncludingInactive() : await footerQuickLinksOps.getAll();
    const footerCertifications = isAdmin ? await footerCertificationsOps.getAllIncludingInactive() : await footerCertificationsOps.getAll();
    const footerBottomBadges = isAdmin ? await footerBottomBadgesOps.getAllIncludingInactive() : await footerBottomBadgesOps.getAll();
    
    let popularCourses: Course[] = [];
    if (!isAdmin) {
      const allCourses = await coursesOps.getAll();
      popularCourses = allCourses.filter(course => course.popular).slice(0, 5);
    }

    return NextResponse.json({
      footerContent,
      footerStats,
      footerQuickLinks,
      footerCertifications,
      footerBottomBadges,
      popularCourses
    });
  } catch (error) {
    console.error('Error fetching footer data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch footer data' },
      { status: 500 }
    );
  }
}

// PUT - Update footer data
async function updateFooterData(
  request: NextRequest,
  _context: { params: unknown }
): Promise<NextResponse> {
  try {
    const { 
      footerContent, 
      footerStats, 
      footerQuickLinks, 
      footerCertifications, 
      footerBottomBadges 
    }: UpdateFooterDataRequest = await request.json();

    // Update footer content
    if (footerContent) {
      const sanitizedFooterContent = {
        id: 1,
        company_name: sanitizeInput.text(footerContent.company_name),
        tagline: sanitizeInput.text(footerContent.tagline),
        slogan: sanitizeInput.text(footerContent.slogan),
        description: sanitizeInput.text(footerContent.description),
        phone: sanitizeInput.phone(footerContent.phone),
        email: sanitizeInput.email(footerContent.email),
        location: sanitizeInput.text(footerContent.location),
        logo_url: sanitizeInput.text(footerContent.logo_url),
        logo_alt: sanitizeInput.text(footerContent.logo_alt),
        copyright_text: sanitizeInput.text(footerContent.copyright_text),
        tagline_bottom: sanitizeInput.text(footerContent.tagline_bottom),
      };
      const validationResult = validateInput.footerContent(sanitizedFooterContent);
      if (!validationResult.success) {
        return NextResponse.json(
          { error: `Footer Content: ${validationResult.error}` },
          { status: 400 }
        );
      }
      await footerContentOps.upsert(validationResult.data);
    }

    // Update footer stats
    if (footerStats && Array.isArray(footerStats)) {
      for (const stat of footerStats) {
        const sanitizedStat = {
          number_text: sanitizeInput.text(stat.number_text),
          label: sanitizeInput.text(stat.label),
          display_order: stat.display_order,
        };
        const validationResult = validateInput.footerStat(sanitizedStat);
        if (!validationResult.success) {
          return NextResponse.json(
            { error: `Footer Stat: ${validationResult.error}` },
            { status: 400 }
          );
        }
        if (stat.id) {
          await footerStatsOps.update(stat.id, validationResult.data);
        }
      }
    }

    // Update footer quick links
    if (footerQuickLinks && Array.isArray(footerQuickLinks)) {
      for (const link of footerQuickLinks) {
        const sanitizedLink = {
          title: sanitizeInput.text(link.title),
          url: link.url, // URL is validated and sanitized in the validation function
          display_order: link.display_order,
          is_active: link.is_active,
        };
        const validationResult = validateInput.footerQuickLink(sanitizedLink);
        if (!validationResult.success) {
          return NextResponse.json(
            { error: `Footer Quick Link: ${validationResult.error}` },
            { status: 400 }
          );
        }
        if (link.id) {
          await footerQuickLinksOps.update(link.id, validationResult.data);
        }
      }
    }

    // Update footer certifications
    if (footerCertifications && Array.isArray(footerCertifications)) {
      for (const cert of footerCertifications) {
        const sanitizedCert = {
          title: sanitizeInput.text(cert.title),
          icon: sanitizeInput.text(cert.icon),
          display_order: cert.display_order,
          is_active: cert.is_active,
        };
        const validationResult = validateInput.footerCertification(sanitizedCert);
        if (!validationResult.success) {
          return NextResponse.json(
            { error: `Footer Certification: ${validationResult.error}` },
            { status: 400 }
          );
        }
        if (cert.id) {
          await footerCertificationsOps.update(cert.id, validationResult.data);
        }
      }
    }

    // Update footer bottom badges
    if (footerBottomBadges && Array.isArray(footerBottomBadges)) {
      for (const badge of footerBottomBadges) {
        const sanitizedBadge = {
          title: sanitizeInput.text(badge.title),
          icon: sanitizeInput.text(badge.icon),
          display_order: badge.display_order,
          is_active: badge.is_active,
        };
        const validationResult = validateInput.footerBottomBadge(sanitizedBadge);
        if (!validationResult.success) {
          return NextResponse.json(
            { error: `Footer Bottom Badge: ${validationResult.error}` },
            { status: 400 }
          );
        }
        if (badge.id) {
          await footerBottomBadgesOps.update(badge.id, validationResult.data);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: '✓ Footer content updated successfully'
    });
  } catch (error) {
    console.error('Error updating footer:', error);
    return NextResponse.json(
      { error: 'Failed to update footer content' },
      { status: 500 }
    );
  }
}

// Export routes
export const GET = getFooterData;
export const PUT: AppRouteHandlerFn = withSecureAuth(updateFooterData);


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
//                           \/                                       \/     \/                 