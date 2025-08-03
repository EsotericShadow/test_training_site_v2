/*
 * Evergreen Web Solutions
 * Written and developed by Gabriel Lacroix
 *
 * File: 20250629000022_create_footer_certifications_table.js
 * Description: To be filled in with the script's purpose
 * Dependencies: To be filled in with key dependencies or modules
 * Created: August 2, 2025
 * Last Modified: August 2, 2025
 * Version: 1.0.0
 */
import { sql } from '@vercel/postgres';

export async function up() {
  await sql`
    CREATE TABLE IF NOT EXISTS footer_certifications (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      icon TEXT,
      display_order INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT TRUE
    );
  `;
  console.log('✅ footer_certifications table created');
}

export async function down() {
  await sql`
    DROP TABLE IF EXISTS footer_certifications;
  `;
  console.log('❌ Dropped footer_certifications table');
}
