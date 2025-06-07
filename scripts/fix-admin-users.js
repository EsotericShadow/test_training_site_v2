import { config } from 'dotenv';
config({ path: '.env.local' });

import { createPool } from '@vercel/postgres';

async function fixAdminUsersTable() {
  const pool = createPool({
    connectionString: process.env.POSTGRES_URL,
  });

  try {
    console.log('🔗 Connecting to database...');
    const testResult = await pool.sql`SELECT NOW() as current_time`;
    console.log('✅ Database connection successful:', testResult.rows[0].current_time);

    console.log('🛠️ Adding token_version column to admin_users...');
    await pool.sql`
      ALTER TABLE admin_users
        ADD COLUMN IF NOT EXISTS token_version INTEGER DEFAULT 0;
    `;
    console.log('✅ Column added successfully');

    console.log('🎉 Fix complete!');
  } catch (err) {
    console.error('❌ Error updating admin_users table:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

fixAdminUsersTable();