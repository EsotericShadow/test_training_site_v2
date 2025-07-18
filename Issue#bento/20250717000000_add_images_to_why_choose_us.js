import { sql } from '@vercel/postgres';

export async function up() {
  await sql`
    ALTER TABLE company_why_choose_us
    ADD COLUMN IF NOT EXISTS image_url TEXT,
    ADD COLUMN IF NOT EXISTS image_alt TEXT;
  `;
  console.log('✅ Added image_url and image_alt to company_why_choose_us table');
}

export async function down() {
  await sql`
    ALTER TABLE company_why_choose_us
    DROP COLUMN IF EXISTS image_url,
    DROP COLUMN IF EXISTS image_alt;
  `;
  console.log('❌ Dropped image_url and image_alt from company_why_choose_us table');
}
