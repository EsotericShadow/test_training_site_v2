import { config } from 'dotenv';
config({ path: '.env.local' });

import { createPool } from '@vercel/postgres';

console.log('Starting admin_users table migration...');

const pool = createPool({
  connectionString: process.env.POSTGRES_URL
});

async function migrateAdminUsers() {
  try {
    console.log('🔗 Connecting to database...');
    const testResult = await pool.sql`SELECT NOW() as current_time`;
    console.log('✅ Database connection successful:', testResult.rows[0].current_time);

    // Add role column if not exists
    await pool.sql`
      ALTER TABLE admin_users
      ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'admin'
      CHECK (role IN ('admin', 'webmaster'))
    `;
    console.log('✅ Added role column to admin_users');

    // Add force_password_change column if not exists
    await pool.sql`
      ALTER TABLE admin_users
      ADD COLUMN IF NOT EXISTS force_password_change BOOLEAN DEFAULT FALSE
    `;
    console.log('✅ Added force_password_change column to admin_users');

    // Update existing admin user to require password change
    await pool.sql`
      UPDATE admin_users
      SET role = 'admin', force_password_change = TRUE
      WHERE username = 'admin'
    `;
    console.log('✅ Updated existing admin user');

    console.log('🎉 Migration complete!');
    await pool.end();
  } catch (err) {
    console.error('❌ Error during migration:', err);
    await pool.end();
    process.exit(1);
  }
}

migrateAdminUsers();