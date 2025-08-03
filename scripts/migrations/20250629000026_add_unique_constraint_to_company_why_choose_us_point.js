/*
 * Evergreen Web Solutions
 * Written and developed by Gabriel Lacroix
 *
 * File: 20250629000026_add_unique_constraint_to_company_why_choose_us_point.js
 * Description: To be filled in with the script's purpose
 * Dependencies: To be filled in with key dependencies or modules
 * Created: August 2, 2025
 * Last Modified: August 2, 2025
 * Version: 1.0.0
 */
import { sql } from '@vercel/postgres';

export async function up() {
  await sql`
    ALTER TABLE company_why_choose_us
    ADD CONSTRAINT unique_company_why_choose_us_point UNIQUE (point);
  `;
  console.log('✅ Added unique constraint to point column in company_why_choose_us table');
}

export async function down() {
  await sql`
    ALTER TABLE company_why_choose_us
    DROP CONSTRAINT IF EXISTS unique_company_why_choose_us_point;
  `;
  console.log('❌ Dropped unique constraint from point column in company_why_choose_us table');
}
