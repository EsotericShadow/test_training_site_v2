import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { 
  footerContentOps, 
  footerStatsOps, 
  footerQuickLinksOps, 
  footerCertificationsOps, 
  footerBottomBadgesOps,
  adminSessionsOps 
} from '../../../../../lib/database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// GET - Get footer data for admin editing
export async function GET(request) {
  try {
    const token = request.cookies.get('admin_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify JWT token
    try {
      jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Check if session exists in database
    const session = await adminSessionsOps.getByToken(token);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 401 }
      );
    }

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
export async function PUT(request) {
  try {
    const token = request.cookies.get('admin_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify JWT token
    try {
      jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Check if session exists in database
    const session = await adminSessionsOps.getByToken(token);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 401 }
      );
    }

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

