import { sql } from '@vercel/postgres';

export async function up() {
  await sql`
    ALTER TABLE company_values
    ADD CONSTRAINT unique_company_value_title UNIQUE (title);
  `;
  console.log('✅ Added unique constraint to title column in company_values table');
}

export async function down() {
  await sql`
    ALTER TABLE company_values
    DROP CONSTRAINT IF EXISTS unique_company_value_title;
  `;
  console.log('❌ Dropped unique constraint from title column in company_values table');
}
