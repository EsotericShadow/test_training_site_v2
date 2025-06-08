import { NextResponse } from 'next/server';
import { withSecureAuth } from '../../../../../lib/secure-jwt';
import { 
  footerContentOps, 
  footerStatsOps, 
  footerQuickLinksOps, 
  footerCertificationsOps, 
  footerBottomBadgesOps
} from '../../../../../lib/database';

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
      await footerContentOps.upsert(footerContent);
    }

    // Update footer stats
    if (footerStats && Array.isArray(footerStats)) {
      for (const stat of footerStats) {
        if (stat.id) {
          await footerStatsOps.update(stat.id, stat);
        }
      }
    }

    // Update footer quick links
    if (footerQuickLinks && Array.isArray(footerQuickLinks)) {
      for (const link of footerQuickLinks) {
        if (link.id) {
          await footerQuickLinksOps.update(link.id, link);
        }
      }
    }

    // Update footer certifications
    if (footerCertifications && Array.isArray(footerCertifications)) {
      for (const cert of footerCertifications) {
        if (cert.id) {
          await footerCertificationsOps.update(cert.id, cert);
        }
      }
    }

    // Update footer bottom badges
    if (footerBottomBadges && Array.isArray(footerBottomBadges)) {
      for (const badge of footerBottomBadges) {
        if (badge.id) {
          await footerBottomBadgesOps.update(badge.id, badge);
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

