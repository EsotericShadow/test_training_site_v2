import { NextResponse } from 'next/server';
import { 
  footerContentOps, 
  footerStatsOps, 
  footerQuickLinksOps, 
  footerCertificationsOps, 
  footerBottomBadgesOps,
  coursesOps 
} from '../../../../lib/database';

// GET - Public access to footer data
export async function GET() {
  try {
    const footerContent = await footerContentOps.get();
    const footerStats = await footerStatsOps.getAll();
    const footerQuickLinks = await footerQuickLinksOps.getAll();
    const footerCertifications = await footerCertificationsOps.getAll();
    const footerBottomBadges = await footerBottomBadgesOps.getAll();
    
    // Get popular courses for footer
    const allCourses = await coursesOps.getAll();
    const popularCourses = allCourses.filter(course => course.popular).slice(0, 5);

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

