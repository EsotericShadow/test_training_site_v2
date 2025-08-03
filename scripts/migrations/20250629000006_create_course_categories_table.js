/*
 * Evergreen Web Solutions
 * Written and developed by Gabriel Lacroix
 *
 * File: 20250629000006_create_course_categories_table.js
 * Description: To be filled in with the script's purpose
 * Dependencies: To be filled in with key dependencies or modules
 * Created: August 2, 2025
 * Last Modified: August 2, 2025
 * Version: 1.0.0
 */
import { sql } from '@vercel/postgres';

export async function up() {
  await sql`
    CREATE TABLE IF NOT EXISTS course_categories (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      display_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  console.log('✅ course_categories table created');
}

export async function down() {
  await sql`
    DROP TABLE IF EXISTS course_categories;
  `;
  console.log('❌ Dropped course_categories table');
}
