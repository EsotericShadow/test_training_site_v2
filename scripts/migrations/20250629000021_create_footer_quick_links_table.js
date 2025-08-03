/*
 * Evergreen Web Solutions
 * Written and developed by Gabriel Lacroix
 *
 * File: 20250629000021_create_footer_quick_links_table.js
 * Description: To be filled in with the script's purpose
 * Dependencies: To be filled in with key dependencies or modules
 * Created: August 2, 2025
 * Last Modified: August 2, 2025
 * Version: 1.0.0
 */
import { sql } from '@vercel/postgres';

export async function up() {
  await sql`
    CREATE TABLE IF NOT EXISTS footer_quick_links (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      display_order INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT TRUE
    );
  `;
  console.log('✅ footer_quick_links table created');
}

export async function down() {
  await sql`
    DROP TABLE IF EXISTS footer_quick_links;
  `;
  console.log('❌ Dropped footer_quick_links table');
}
