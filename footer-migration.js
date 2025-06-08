// Footer CMS Database Migration
// Run this script to add footer management tables to your existing database

import { config } from 'dotenv';
config({ path: '.env.local' });

import { createPool } from '@vercel/postgres';

console.log('Starting footer CMS database migration...');

const pool = createPool({
  connectionString: process.env.POSTGRES_URL
});

async function addFooterTables() {
  try {
    console.log('🔗 Connecting to database...');
    
    // Test the connection first
    const testResult = await pool.sql`SELECT NOW() as current_time`;
    console.log('✅ Database connection successful:', testResult.rows[0].current_time);

    // Footer main content table
    await pool.sql`
      CREATE TABLE IF NOT EXISTS footer_content (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        company_name TEXT NOT NULL DEFAULT 'Karma Training',
        tagline TEXT DEFAULT 'Industrial Safety Northwestern BC',
        slogan TEXT DEFAULT 'We believe the choices you make today will define your tomorrow',
        description TEXT DEFAULT 'Karma Training is Northwestern British Columbia''s premier provider of workplace safety training.',
        phone TEXT DEFAULT '250-615-3727',
        email TEXT DEFAULT 'info@karmatraining.ca',
        location TEXT DEFAULT 'Northwestern British Columbia',
        logo_url TEXT DEFAULT '/assets/logos/logo.png',
        logo_alt TEXT DEFAULT 'Karma Training Logo',
        copyright_text TEXT DEFAULT '© 2025 Karma Training. All rights reserved.',
        tagline_bottom TEXT DEFAULT 'Professional Safety Training for Northwestern BC',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ footer_content table created');

    // Footer statistics table
    await pool.sql`
      CREATE TABLE IF NOT EXISTS footer_stats (
        id SERIAL PRIMARY KEY,
        number_text TEXT NOT NULL,
        label TEXT NOT NULL,
        display_order INTEGER DEFAULT 0
      )
    `;
    console.log('✅ footer_stats table created');

    // Footer quick links table
    await pool.sql`
      CREATE TABLE IF NOT EXISTS footer_quick_links (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        url TEXT NOT NULL,
        display_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE
      )
    `;
    console.log('✅ footer_quick_links table created');

    // Footer certifications table
    await pool.sql`
      CREATE TABLE IF NOT EXISTS footer_certifications (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        icon TEXT DEFAULT 'Award',
        display_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE
      )
    `;
    console.log('✅ footer_certifications table created');

    // Footer bottom badges table
    await pool.sql`
      CREATE TABLE IF NOT EXISTS footer_bottom_badges (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        icon TEXT DEFAULT 'Award',
        display_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE
      )
    `;
    console.log('✅ footer_bottom_badges table created');

    // Insert default footer content
    await insertDefaultFooterData();

    console.log('🎉 Footer CMS database migration complete!');
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error creating footer tables:', err);
    await pool.end();
    process.exit(1);
  }
}

async function insertDefaultFooterData() {
  try {
    // Insert default footer content
    const existingFooter = await pool.sql`SELECT 1 FROM footer_content WHERE id = 1`;
    if (existingFooter.rows.length === 0) {
      await pool.sql`
        INSERT INTO footer_content (id) VALUES (1)
      `;
      console.log('✅ Default footer content created');
    }

    // Insert default footer stats
    const existingStats = await pool.sql`SELECT COUNT(*) as count FROM footer_stats`;
    if (existingStats.rows[0].count === '0') {
      await pool.sql`
        INSERT INTO footer_stats (number_text, label, display_order) VALUES
        ('2017', 'Established', 1),
        ('70+', 'Years Experience', 2),
        ('2000+', 'Students Trained', 3)
      `;
      console.log('✅ Default footer stats created');
    }

    // Insert default quick links
    const existingLinks = await pool.sql`SELECT COUNT(*) as count FROM footer_quick_links`;
    if (existingLinks.rows[0].count === '0') {
      await pool.sql`
        INSERT INTO footer_quick_links (title, url, display_order) VALUES
        ('About Us', '/about', 1),
        ('All Courses', '/courses', 2),
        ('Contact & Quote', '/contact', 3),
        ('Our Team', '/about#team', 4),
        ('Privacy Policy', '/privacy', 5),
        ('Terms of Use', '/terms', 6)
      `;
      console.log('✅ Default footer quick links created');
    }

    // Insert default certifications
    const existingCerts = await pool.sql`SELECT COUNT(*) as count FROM footer_certifications`;
    if (existingCerts.rows[0].count === '0') {
      await pool.sql`
        INSERT INTO footer_certifications (title, icon, display_order) VALUES
        ('Certificate of Completion', 'Award', 1),
        ('Industry Recognized', 'Users', 2),
        ('IVES Certification Available', 'Award', 3),
        ('WorkSafeBC Compliant', 'Users', 4)
      `;
      console.log('✅ Default footer certifications created');
    }

    // Insert default bottom badges
    const existingBadges = await pool.sql`SELECT COUNT(*) as count FROM footer_bottom_badges`;
    if (existingBadges.rows[0].count === '0') {
      await pool.sql`
        INSERT INTO footer_bottom_badges (title, icon, display_order) VALUES
        ('WorkSafeBC Compliant', 'Award', 1),
        ('IVES Certified', 'Users', 2)
      `;
      console.log('✅ Default footer bottom badges created');
    }

  } catch (error) {
    console.error('❌ Error inserting default footer data:', error);
    throw error;
  }
}

addFooterTables();

