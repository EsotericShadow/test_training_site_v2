import { sql } from '@vercel/postgres';

export async function up() {
  await sql`
    CREATE TABLE IF NOT EXISTS company_why_choose_us (
      id SERIAL PRIMARY KEY,
      point TEXT NOT NULL,
      display_order INTEGER DEFAULT 0
    );
  `;
  console.log('✅ company_why_choose_us table created');
}

export async function down() {
  await sql`
    DROP TABLE IF EXISTS company_why_choose_us;
  `;
  console.log('❌ Dropped company_why_choose_us table');
}
