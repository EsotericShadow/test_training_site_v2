/*
 * Evergreen Web Solutions
 * Written and developed by Gabriel Lacroix
 *
 * File: 20250629000004_create_company_values_table.js
 * Description: To be filled in with the script's purpose
 * Dependencies: To be filled in with key dependencies or modules
 * Created: August 2, 2025
 * Last Modified: August 2, 2025
 * Version: 1.0.0
 */
import { sql } from '@vercel/postgres';

export async function up() {
  await sql`
    CREATE TABLE IF NOT EXISTS company_values (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      icon TEXT,
      display_order INTEGER DEFAULT 0
    );
  `;
  console.log('✅ company_values table created');
}

export async function down() {
  await sql`
    DROP TABLE IF EXISTS company_values;
  `;
  console.log('❌ Dropped company_values table');
}
