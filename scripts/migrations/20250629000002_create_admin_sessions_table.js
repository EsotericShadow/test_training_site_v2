/*
 * Evergreen Web Solutions
 * Written and developed by Gabriel Lacroix
 *
 * File: 20250629000002_create_admin_sessions_table.js
 * Description: To be filled in with the script's purpose
 * Dependencies: To be filled in with key dependencies or modules
 * Created: August 2, 2025
 * Last Modified: August 2, 2025
 * Version: 1.0.0
 */
import { sql } from '@vercel/postgres';

export async function up() {
  await sql`
    CREATE TABLE IF NOT EXISTS admin_sessions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES admin_users(id),
      token TEXT UNIQUE NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      ip_address TEXT,
      user_agent TEXT
    );
  `;
  console.log('✅ admin_sessions table created');
}

export async function down() {
  await sql`
    DROP TABLE IF EXISTS admin_sessions;
  `;
  console.log('❌ Dropped admin_sessions table');
}
