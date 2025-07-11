import { sql } from '@vercel/postgres';

export async function up() {
  await sql`
    CREATE TABLE IF NOT EXISTS footer_content (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      company_name TEXT,
      tagline TEXT,
      slogan TEXT,
      description TEXT,
      phone TEXT,
      email TEXT,
      location TEXT,
      logo_url TEXT,
      logo_alt TEXT,
      copyright_text TEXT,
      tagline_bottom TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  console.log('✅ footer_content table created');
}

export async function down() {
  await sql`
    DROP TABLE IF EXISTS footer_content;
  `;
  console.log('❌ Dropped footer_content table');
}
