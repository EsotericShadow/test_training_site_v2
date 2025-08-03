/*
 * Evergreen Web Solutions
 * Written and developed by Gabriel Lacroix
 *
 * File: 20250716000000_add_overview_to_courses.js
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
    ADD COLUMN overview TEXT,
    ADD COLUMN includes TEXT,
    ADD COLUMN format TEXT,
    ADD COLUMN passing_grade TEXT;
  `;
}
