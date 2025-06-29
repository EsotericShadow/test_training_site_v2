import { sql } from '@vercel/postgres';

export async function up() {
  await sql`
    ALTER TABLE company_why_choose_us
    ADD CONSTRAINT unique_company_why_choose_us_point UNIQUE (point);
  `;
  console.log('✅ Added unique constraint to point column in company_why_choose_us table');
}

export async function down() {
  await sql`
    ALTER TABLE company_why_choose_us
    DROP CONSTRAINT IF EXISTS unique_company_why_choose_us_point;
  `;
  console.log('❌ Dropped unique constraint from point column in company_why_choose_us table');
}
