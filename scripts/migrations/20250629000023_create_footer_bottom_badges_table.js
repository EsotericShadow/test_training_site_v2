import { sql } from '@vercel/postgres';

export async function up() {
  await sql`
    CREATE TABLE IF NOT EXISTS footer_bottom_badges (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      icon TEXT,
      display_order INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT TRUE
    );
  `;
  console.log('✅ footer_bottom_badges table created');
}

export async function down() {
  await sql`
    DROP TABLE IF EXISTS footer_bottom_badges;
  `;
  console.log('❌ Dropped footer_bottom_badges table');
}
