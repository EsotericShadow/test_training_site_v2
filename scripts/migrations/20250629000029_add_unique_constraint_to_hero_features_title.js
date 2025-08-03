/*
 * Evergreen Web Solutions
 * Written and developed by Gabriel Lacroix
 *
 * File: 20250629000029_add_unique_constraint_to_hero_features_title.js
 * Description: To be filled in with the script's purpose
 * Dependencies: To be filled in with key dependencies or modules
 * Created: August 2, 2025
 * Last Modified: August 2, 2025
 * Version: 1.0.0
 */
import { sql } from '@vercel/postgres';

export async function up() {
  await sql`
    ALTER TABLE hero_features
    ADD CONSTRAINT unique_hero_features_title UNIQUE (title);
  `;
  console.log('✅ Added unique constraint to title column in hero_features table');
}

export async function down() {
  await sql`
    ALTER TABLE hero_features
    DROP CONSTRAINT IF EXISTS unique_hero_features_title;
  `;
  console.log('❌ Dropped unique constraint from title column in hero_features table');
}
