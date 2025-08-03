/*
 * Evergreen Web Solutions
 * Written and developed by Gabriel Lacroix
 *
 * File: 20250629000011_create_hero_section_table.js
 * Description: To be filled in with the script's purpose
 * Dependencies: To be filled in with key dependencies or modules
 * Created: August 2, 2025
 * Last Modified: August 2, 2025
 * Version: 1.0.0
 */
import { sql } from '@vercel/postgres';

export async function up() {
  await sql`
    CREATE TABLE IF NOT EXISTS hero_section (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      slogan TEXT,
      main_heading TEXT,
      highlight_text TEXT,
      subtitle TEXT,
      background_image_url TEXT,
      background_image_alt TEXT,
      primary_button_text TEXT,
      primary_button_link TEXT,
      secondary_button_text TEXT,
      secondary_button_link TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  console.log('✅ hero_section table created');
}

export async function down() {
  await sql`
    DROP TABLE IF EXISTS hero_section;
  `;
  console.log('❌ Dropped hero_section table');
}
