/*
 * Evergreen Web Solutions
 * Written and developed by Gabriel Lacroix
 *
 * File: 20250629000001_create_admin_users_table.js
 * Description: To be filled in with the script's purpose
 * Dependencies: To be filled in with key dependencies or modules
 * Created: August 2, 2025
 * Last Modified: August 2, 2025
 * Version: 1.0.0
 */
import { sql } from '@vercel/postgres';

export async function up() {
  await sql`
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
    );
  `;
  console.log('✅ Created admin_users table');
}

export async function down() {
  await sql`
    DROP TABLE IF EXISTS admin_users;
  `;
  console.log('❌ Dropped admin_users table');
}
