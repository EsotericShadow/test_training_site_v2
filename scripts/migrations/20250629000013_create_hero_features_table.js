/*
 * Evergreen Web Solutions
 * Written and developed by Gabriel Lacroix
 *
 * File: 20250629000013_create_hero_features_table.js
 * Description: To be filled in with the script's purpose
 * Dependencies: To be filled in with key dependencies or modules
 * Created: August 2, 2025
 * Last Modified: August 2, 2025
 * Version: 1.0.0
 */
import { sql } from '@vercel/postgres';

export async function up() {
  await sql`
    CREATE TABLE IF NOT EXISTS hero_features (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      display_order INTEGER DEFAULT 0
    );
  `;
  console.log('✅ hero_features table created');
}

export async function down() {
  await sql`
    DROP TABLE IF EXISTS hero_features;
  `;
  console.log('❌ Dropped hero_features table');
}
