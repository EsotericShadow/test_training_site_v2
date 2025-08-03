/*
 * Evergreen Web Solutions
 * Written and developed by Gabriel Lacroix
 *
 * File: 20250629000031_add_unique_constraint_to_courses_slug.js
 * Description: To be filled in with the script's purpose
 * Dependencies: To be filled in with key dependencies or modules
 * Created: August 2, 2025
 * Last Modified: August 2, 2025
 * Version: 1.0.0
 */
import { sql } from '@vercel/postgres';

export async function up() {
  await sql`
    ALTER TABLE courses
    ADD CONSTRAINT unique_course_slug UNIQUE (slug);
  `;
  console.log('✅ Added unique constraint to slug column in courses table');
}

export async function down() {
  await sql`
    ALTER TABLE courses
    DROP CONSTRAINT IF EXISTS unique_course_slug;
  `;
  console.log('❌ Dropped unique constraint from slug column in courses table');
}
