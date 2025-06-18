import { config } from 'dotenv';
config({ path: '.env.local' });

import { createPool } from '@vercel/postgres';
import bcrypt from 'bcryptjs';

console.log('Starting database initialization...');

// Create a connection pool with explicit connection string
const pool = createPool({
  connectionString: process.env.POSTGRES_URL
});

async function initializeDatabase() {
  try {
    console.log('🔗 Connecting to database...');
    
    // Test the connection
    const testResult = await pool.sql`SELECT NOW() as current_time`;
    console.log('✅ Database connection successful:', testResult.rows[0].current_time);

    // Admin users table with role and force_password_change
    await pool.sql`
      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        email TEXT,
        role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'webmaster')),
        force_password_change BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP,
        token_version INTEGER DEFAULT 0
      )
    `;
    console.log('✅ admin_users table created');

    // Admin sessions table
    await pool.sql`
      CREATE TABLE IF NOT EXISTS admin_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES admin_users(id),
        token TEXT UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ip_address TEXT,
        user_agent TEXT
      )
    `;
    console.log('✅ admin_sessions table created');

    // Company info table
    await pool.sql`
      CREATE TABLE IF NOT EXISTS company_info (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        company_name TEXT NOT NULL,
        slogan TEXT,
        description TEXT,
        mission TEXT,
        total_experience INTEGER,
        students_trained_count INTEGER,
        established_year INTEGER,
        total_courses INTEGER,
        phone TEXT,
        email TEXT,
        location TEXT,
        business_hours TEXT,
        response_time TEXT,
        service_area TEXT,
        emergency_availability TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ company_info table created');

    // Company values table
    await pool.sql`
      CREATE TABLE IF NOT EXISTS company_values (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        icon TEXT,
        display_order INTEGER DEFAULT 0
      )
    `;
    console.log('✅ company_values table created');

    // Company why choose us table
    await pool.sql`
      CREATE TABLE IF NOT EXISTS company_why_choose_us (
        id SERIAL PRIMARY KEY,
        point TEXT NOT NULL,
        display_order INTEGER DEFAULT 0
      )
    `;
    console.log('✅ company_why_choose_us table created');

    // Course categories table
    await pool.sql`
      CREATE TABLE IF NOT EXISTS course_categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ course_categories table created');

    // Courses table
    await pool.sql`
      CREATE TABLE IF NOT EXISTS courses (
        id SERIAL PRIMARY KEY,
        slug TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        duration TEXT,
        audience TEXT,
        category_id INTEGER REFERENCES course_categories(id),
        popular BOOLEAN DEFAULT FALSE,
        image_url TEXT,
        image_alt TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ courses table created');

    // Course features table
    await pool.sql`
      CREATE TABLE IF NOT EXISTS course_features (
        id SERIAL PRIMARY KEY,
        course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        feature TEXT NOT NULL,
        display_order INTEGER DEFAULT 0
      )
    `;
    console.log('✅ course_features table created');

    // Team members table
    await pool.sql`
      CREATE TABLE IF NOT EXISTS team_members (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        bio TEXT,
        photo_url TEXT,
        experience_years INTEGER,
        specializations TEXT,
        featured BOOLEAN DEFAULT FALSE,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ team_members table created');

    // Testimonials table
    await pool.sql`
      CREATE TABLE IF NOT EXISTS testimonials (
        id SERIAL PRIMARY KEY,
        client_name TEXT NOT NULL,
        client_role TEXT NOT NULL,
        company TEXT NOT NULL,
        industry TEXT,
        content TEXT NOT NULL,
        rating INTEGER DEFAULT 5,
        client_photo_url TEXT,
        featured BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ testimonials table created');

    // Hero section table
    await pool.sql`
      CREATE TABLE IF NOT EXISTS hero_section (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        slogan TEXT,
        main_heading TEXT,
        highlight_text TEXT,
        subtitle TEXT,
        background_image_url TEXT,
        background_image_alt TEXT,
        primary_button_text TEXT,
        primary_button_link TEXT,
        secondary_button_text TEXT,
        secondary_button_link TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ hero_section table created');

    // Hero stats table
    await pool.sql`
      CREATE TABLE IF NOT EXISTS hero_stats (
        id SERIAL PRIMARY KEY,
        number_text TEXT NOT NULL,
        label TEXT NOT NULL,
        description TEXT,
        display_order INTEGER DEFAULT 0
      )
    `;
    console.log('✅ hero_stats table created');

    // Hero features table
    await pool.sql`
      CREATE TABLE IF NOT EXISTS hero_features (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        display_order INTEGER DEFAULT 0
      )
    `;
    console.log('✅ hero_features table created');

    // Initialize admin users
    if (process.env.NODE_ENV !== 'production' && process.env.INIT_DEFAULT_ADMIN === 'true') {
      await createDefaultAdmin();
    } else {
      console.log('ℹ️ Skipping default admin creation in production or without INIT_DEFAULT_ADMIN=true');
    }

    console.log('🎉 Database initialization complete!');
    await pool.end();
  } catch (err) {
    console.error('❌ Error initializing database:', err);
    await pool.end();
    process.exit(1);
  }
}

async function createDefaultAdmin() {
  try {
    // Get credentials from environment variables
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminEmail = process.env.ADMIN_EMAIL || 'info@karmatraining.com';
    const webmasterUsername = process.env.WEBMASTER_USERNAME || 'webmaster';
    const webmasterPassword = process.env.WEBMASTER_PASSWORD;
    const webmasterEmail = process.env.WEBMASTER_EMAIL || 'webmaster@karmatraining.com';

    if (!adminPassword || !webmasterPassword) {
      console.error('❌ ADMIN_PASSWORD and WEBMASTER_PASSWORD must be set in .env.local');
      process.exit(1);
    }

    // Create admin user
    const existingAdmin = await pool.sql`SELECT 1 FROM admin_users WHERE username = ${adminUsername}`;
    if (existingAdmin.rows.length === 0) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await pool.sql`
        INSERT INTO admin_users (username, password_hash, email, role, force_password_change)
        VALUES (${adminUsername}, ${hashedPassword}, ${adminEmail}, 'admin', TRUE)
      `;
      console.log(`✅ Created admin user: ${adminUsername}`);
    } else {
      console.log(`ℹ️ Admin user ${adminUsername} already exists`);
    }

    // Create webmaster user
    const existingWebmaster = await pool.sql`SELECT 1 FROM admin_users WHERE username = ${webmasterUsername}`;
    if (existingWebmaster.rows.length === 0) {
      const hashedPassword = await bcrypt.hash(webmasterPassword, 10);
      await pool.sql`
        INSERT INTO admin_users (username, password_hash, email, role, force_password_change)
        VALUES (${webmasterUsername}, ${hashedPassword}, ${webmasterEmail}, 'webmaster', FALSE)
      `;
      console.log(`✅ Created webmaster user: ${webmasterUsername}`);
    } else {
      console.log(`ℹ️ Webmaster user ${webmasterUsername} already exists`);
    }
  } catch (err) {
    console.error('❌ Error creating default admin users:', err);
    throw err;
  }
}

initializeDatabase();