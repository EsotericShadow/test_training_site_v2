import { config } from 'dotenv';
config({ path: '.env.local' });

import { createPool } from '@vercel/postgres';

async function fixAdminSessionsTable() {
  const pool = createPool({
    connectionString: process.env.POSTGRES_URL,
  });

  try {
    console.log('🔗 Connecting to database...');
    const testResult = await pool.sql`SELECT NOW() as current_time`;
    console.log('✅ Database connection successful:', testResult.rows[0].current_time);

    console.log('🛠️ Adding missing columns to admin_sessions...');
    await pool.sql`
      ALTER TABLE admin_sessions
        ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ADD COLUMN IF NOT EXISTS ip_address TEXT,
        ADD COLUMN IF NOT EXISTS user_agent TEXT;
    `;
    console.log('✅ Columns added successfully');

    console.log('🎉 Fix complete!');
  } catch (err) {
    console.error('❌ Error updating admin_sessions table:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

fixAdminSessionsTable();
