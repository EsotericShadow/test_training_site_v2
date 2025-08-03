/*
 * Karma Industrial Safety Training Website
 * Written and developed by Gabriel Lacroix for Evergreen Web Solutions
 *
 * File: 20250803000003_add_unique_constraint_to_footer_bottom_badges_icon.js
 * Description: Adds a unique constraint to the 'icon' column of the footer_bottom_badges table.
 * Created: 2025-08-03
 * Version: 1.0.0
 */

import { sql } from '@vercel/postgres';

export async function up() {
  await sql`
    ALTER TABLE footer_bottom_badges
    ADD CONSTRAINT unique_footer_bottom_badges_icon UNIQUE (icon);
  `;
}

export async function down() {
  await sql`
    ALTER TABLE footer_bottom_badges
    DROP CONSTRAINT IF EXISTS unique_footer_bottom_badges_icon;
  `;
}
