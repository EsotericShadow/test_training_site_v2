import { sql } from '@vercel/postgres';

export async function up() {
  await sql`
    CREATE TABLE IF NOT EXISTS failed_login_attempts (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL,
      ip_address TEXT,
      attempt_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  console.log('✅ failed_login_attempts table created');
}

export async function down() {
  await sql`
    DROP TABLE IF EXISTS failed_login_attempts;
  `;
  console.log('❌ Dropped failed_login_attempts table');
}
