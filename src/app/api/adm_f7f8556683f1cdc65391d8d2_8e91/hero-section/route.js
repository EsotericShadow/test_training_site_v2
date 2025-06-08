import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { heroSectionOps, heroStatsOps, heroFeaturesOps, adminSessionsOps } from '../../../../../lib/database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// GET - Get hero section data for admin editing
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

