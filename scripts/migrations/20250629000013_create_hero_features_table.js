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
