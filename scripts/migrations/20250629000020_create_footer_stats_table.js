import { sql } from '@vercel/postgres';

export async function up() {
  await sql`
    CREATE TABLE IF NOT EXISTS footer_stats (
      id SERIAL PRIMARY KEY,
      number_text TEXT NOT NULL,
      label TEXT NOT NULL,
      display_order INTEGER DEFAULT 0
    );
  `;
  console.log('✅ footer_stats table created');
}

export async function down() {
  await sql`
    DROP TABLE IF EXISTS footer_stats;
  `;
  console.log('❌ Dropped footer_stats table');
}
