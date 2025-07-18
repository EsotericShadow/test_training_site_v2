import { sql } from '@vercel/postgres';

export async function up() {
  await sql`
    ALTER TABLE courses
    ADD COLUMN what_youll_learn TEXT;
  `;
}
