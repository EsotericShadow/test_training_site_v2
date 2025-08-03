/*
 * Karma Industrial Safety Training Website
 * Written and developed by Gabriel Lacroix for Evergreen Web Solutions
 *
 * File: 20250803000002_add_footer_logos.js
 * Description: Adds WorkSafeBC and Ives Training Group logos as footer bottom badges.
 * Created: 2025-08-03
 * Version: 1.0.0
 */

import { sql } from '@vercel/postgres';

export async function up() {
  await sql`
    INSERT INTO footer_bottom_badges (title, icon, display_order, is_active)
    VALUES
      ('WorkSafeBC', '/assets/logos/WorkSafeBC-logo-rgb.png', 100, TRUE),
      ('Ives Training Group', '/assets/logos/ives-training-group.png', 101, TRUE)
    ON CONFLICT (icon) DO NOTHING;
  `;
}

export async function down() {
  await sql`
    DELETE FROM footer_bottom_badges WHERE icon IN (
      '/assets/logos/WorkSafeBC-logo-rgb.png',
      '/assets/logos/ives-training-group.png'
    );
  `;
}
