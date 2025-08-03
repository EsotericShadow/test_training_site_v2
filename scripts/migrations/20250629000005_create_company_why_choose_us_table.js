/*
 * Evergreen Web Solutions
 * Written and developed by Gabriel Lacroix
 *
 * File: 20250629000005_create_company_why_choose_us_table.js
 * Description: To be filled in with the script's purpose
 * Dependencies: To be filled in with key dependencies or modules
 * Created: August 2, 2025
 * Last Modified: August 2, 2025
 * Version: 1.0.0
 */
import { sql } from '@vercel/postgres';

export async function up() {
  await sql`
    CREATE TABLE IF NOT EXISTS company_why_choose_us (
      id SERIAL PRIMARY KEY,
      point TEXT NOT NULL,
      display_order INTEGER DEFAULT 0
    );
  `;
  console.log('✅ company_why_choose_us table created');
}

export async function down() {
  await sql`
    DROP TABLE IF EXISTS company_why_choose_us;
  `;
  console.log('❌ Dropped company_why_choose_us table');
}
