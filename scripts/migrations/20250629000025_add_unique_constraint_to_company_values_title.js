/*
 * Evergreen Web Solutions
 * Written and developed by Gabriel Lacroix
 *
 * File: 20250629000025_add_unique_constraint_to_company_values_title.js
 * Description: To be filled in with the script's purpose
 * Dependencies: To be filled in with key dependencies or modules
 * Created: August 2, 2025
 * Last Modified: August 2, 2025
 * Version: 1.0.0
 */
import { sql } from '@vercel/postgres';

export async function up() {
  await sql`
    ALTER TABLE company_values
    ADD CONSTRAINT unique_company_value_title UNIQUE (title);
  `;
  console.log('✅ Added unique constraint to title column in company_values table');
}

export async function down() {
  await sql`
    ALTER TABLE company_values
    DROP CONSTRAINT IF EXISTS unique_company_value_title;
  `;
  console.log('❌ Dropped unique constraint from title column in company_values table');
}
