/*
 * Evergreen Web Solutions
 * Written and developed by Gabriel Lacroix
 *
 * File: 20250629000032_add_unique_constraint_to_course_categories_name.js
 * Description: To be filled in with the script's purpose
 * Dependencies: To be filled in with key dependencies or modules
 * Created: August 2, 2025
 * Last Modified: August 2, 2025
 * Version: 1.0.0
 */
import { sql } from '@vercel/postgres';

export async function up() {
  await sql`
    ALTER TABLE course_categories
    ADD CONSTRAINT unique_course_category_name UNIQUE (name);
  `;
  console.log('✅ Added unique constraint to name column in course_categories table');
}

export async function down() {
  await sql`
    ALTER TABLE course_categories
    DROP CONSTRAINT IF EXISTS unique_course_category_name;
  `;
  console.log('❌ Dropped unique constraint from name column in course_categories table');
}
