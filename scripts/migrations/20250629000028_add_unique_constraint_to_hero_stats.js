/*
 * Evergreen Web Solutions
 * Written and developed by Gabriel Lacroix
 *
 * File: 20250629000028_add_unique_constraint_to_hero_stats.js
 * Description: To be filled in with the script's purpose
 * Dependencies: To be filled in with key dependencies or modules
 * Created: August 2, 2025
 * Last Modified: August 2, 2025
 * Version: 1.0.0
 */
import { sql } from '@vercel/postgres';

export async function up() {
  await sql`
    ALTER TABLE hero_stats
    ADD CONSTRAINT unique_hero_stats_number_text_label UNIQUE (number_text, label);
  `;
  console.log('✅ Added unique constraint to (number_text, label) in hero_stats table');
}

export async function down() {
  await sql`
    ALTER TABLE hero_stats
    DROP CONSTRAINT IF EXISTS unique_hero_stats_number_text_label;
  `;
  console.log('❌ Dropped unique constraint from (number_text, label) in hero_stats table');
}
