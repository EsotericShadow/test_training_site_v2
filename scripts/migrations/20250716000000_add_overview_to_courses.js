import { sql } from '@vercel/postgres';

export async function up() {
  await sql`
    ALTER TABLE courses
    ADD COLUMN overview TEXT,
    ADD COLUMN includes TEXT,
    ADD COLUMN format TEXT,
    ADD COLUMN passing_grade TEXT;
  `;
}
