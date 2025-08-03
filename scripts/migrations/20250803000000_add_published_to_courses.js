/*
 * Evergreen Web Solutions
 * Written and developed by Gabriel Lacroix
 *
 * File: 20250803000000_add_published_to_courses.js
 * Description: Adds a 'published' column to the courses table.
 * Dependencies: @vercel/postgres
 * Created: August 3, 2025
 * Version: 1.0.0
 */
import { sql } from '@vercel/postgres';

export async function up() {
  await sql`
    ALTER TABLE courses
    ADD COLUMN published BOOLEAN DEFAULT FALSE;
  `;
}

export async function down() {
  await sql`
    ALTER TABLE courses
    DROP COLUMN published;
  `;
}
