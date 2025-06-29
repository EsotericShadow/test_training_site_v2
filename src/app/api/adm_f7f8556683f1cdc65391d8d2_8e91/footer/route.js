import { NextResponse } from 'next/server';
import { withSecureAuth } from '../../../../../lib/secure-jwt';
import { 
  footerContentOps, 
  footerStatsOps, 
  footerQuickLinksOps, 
  footerCertificationsOps, 
  footerBottomBadgesOps
} from '../../../../../lib/database';
import { sanitizeInput, validateInput } from '../../../../../lib/security-utils';

// GET - Get footer data for admin editing
async function getFooterData() {
  try {
    const footerContent = await footerContentOps.get();
    const footerStats = await footerStatsOps.getAll();
    const footerQuickLinks = await footerQuickLinksOps.getAllIncludingInactive();
    const footerCertifications = await footerCertificationsOps.getAllIncludingInactive();
    const footerBottomBadges = await footerBottomBadgesOps.getAllIncludingInactive();

    return NextResponse.json({
      footerContent,
      footerStats,
      footerQuickLinks,
      footerCertifications,
      footerBottomBadges
    });
  } catch (error) {
    console.error('Error fetching footer data for admin:', error);
    return NextResponse.json(
      { error: 'Failed to fetch footer data' },
      { status: 500 }
    );
  }
}

// PUT - Update footer data
async function updateFooterData(request) {
  try {
    const { 
      footerContent, 
      footerStats, 
      footerQuickLinks, 
      footerCertifications, 
      footerBottomBadges 
    } = await request.json();

    // Update footer content
    if (footerContent) {
      const sanitizedFooterContent = {
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
          url: sanitizeInput.text(link.url),
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

// Export secured routes
export const GET = withSecureAuth(getFooterData);
export const PUT = withSecureAuth(updateFooterData);

