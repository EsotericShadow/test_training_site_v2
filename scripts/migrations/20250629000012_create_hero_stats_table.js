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
