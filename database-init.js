// Load environment variables FIRST, before any other imports
import { config } from 'dotenv';
config({ path: '.env.local' });

// Now import @vercel/postgres with the environment variables already loaded
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
    
    // Test the connection first
    const testResult = await pool.sql`SELECT NOW() as current_time`;
    console.log('✅ Database connection successful:', testResult.rows[0].current_time);

  // Admin users table
  await pool.sql`
    CREATE TABLE IF NOT EXISTS admin_users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      email TEXT,
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

    // Create default admin user
    await createDefaultAdmin();
  } catch (err) {
    console.error('❌ Error creating tables:', err);
    process.exit(1);
  }
}

async function createDefaultAdmin() {
  try {
    const defaultPassword = 'Admin@123456';
    const hashedPassword = bcrypt.hashSync(defaultPassword, 10);

    const existingAdmin = await pool.sql`SELECT 1 FROM admin_users WHERE username = 'admin'`;
    if (existingAdmin.rows.length === 0) {
      await pool.sql`
        INSERT INTO admin_users (username, password_hash, email)
        VALUES ('admin', ${hashedPassword}, 'info@karmatraining.com')
      `;
      console.log('✅ Default admin user created:');
      console.log('   Username: admin');
      console.log('   Password: Admin@123456');
    } else {
      console.log('ℹ️ Admin user already exists');
    }

    console.log('🎉 Database initialization complete!');
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error creating default admin:', err);
    await pool.end();
    process.exit(1);
  }
}

initializeDatabase();

