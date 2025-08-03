/*
 * Evergreen Web Solutions
 * Written and developed by Gabriel Lacroix
 *
 * File: 20250629000012_create_hero_stats_table.js
 * Description: To be filled in with the script's purpose
 * Dependencies: To be filled in with key dependencies or modules
 * Created: August 2, 2025
 * Last Modified: August 2, 2025
 * Version: 1.0.0
 */
import { sql } from '@vercel/postgres';

export async function up() {
  await sql`
    CREATE TABLE IF NOT EXISTS hero_stats (
      id SERIAL PRIMARY KEY,
      number_text TEXT NOT NULL,
      label TEXT NOT NULL,
      description TEXT,
      display_order INTEGER DEFAULT 0
    );
  `;
  console.log('✅ hero_stats table created');
}

export async function down() {
  await sql`
    DROP TABLE IF EXISTS hero_stats;
  `;
  console.log('❌ Dropped hero_stats table');
}
