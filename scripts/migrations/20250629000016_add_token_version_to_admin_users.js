/*
 * Evergreen Web Solutions
 * Written and developed by Gabriel Lacroix
 *
 * File: 20250629000016_add_token_version_to_admin_users.js
 * Description: To be filled in with the script's purpose
 * Dependencies: To be filled in with key dependencies or modules
 * Created: August 2, 2025
 * Last Modified: August 2, 2025
 * Version: 1.0.0
 */
import { sql } from '@vercel/postgres';

export async function up() {
  await sql`
    ALTER TABLE admin_users
    ADD COLUMN IF NOT EXISTS token_version INTEGER DEFAULT 0;
  `;
  console.log('✅ Added token_version to admin_users table');
}

export async function down() {
  await sql`
    ALTER TABLE admin_users
    DROP COLUMN IF EXISTS token_version;
  `;
  console.log('❌ Dropped token_version from admin_users table');
}
