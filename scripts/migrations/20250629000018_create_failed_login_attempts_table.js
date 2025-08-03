/*
 * Evergreen Web Solutions
 * Written and developed by Gabriel Lacroix
 *
 * File: 20250629000018_create_failed_login_attempts_table.js
 * Description: To be filled in with the script's purpose
 * Dependencies: To be filled in with key dependencies or modules
 * Created: August 2, 2025
 * Last Modified: August 2, 2025
 * Version: 1.0.0
 */
import { sql } from '@vercel/postgres';

export async function up() {
  await sql`
    CREATE TABLE IF NOT EXISTS failed_login_attempts (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL,
      ip_address TEXT,
      attempt_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  console.log('✅ failed_login_attempts table created');
}

export async function down() {
  await sql`
    DROP TABLE IF EXISTS failed_login_attempts;
  `;
  console.log('❌ Dropped failed_login_attempts table');
}
