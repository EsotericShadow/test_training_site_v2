import { sql } from '@vercel/postgres';

export async function up() {
  await sql`
    CREATE TABLE IF NOT EXISTS company_info (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      company_name TEXT NOT NULL,
      slogan TEXT,
      description TEXT,
      mission TEXT,
      total_experience INTEGER,
      students_trained_count INTEGER,
      established_year INTEGER,
      total_courses INTEGER,
      phone TEXT,
      email TEXT,
      location TEXT,
      business_hours TEXT,
      response_time TEXT,
      service_area TEXT,
      emergency_availability TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  console.log('✅ company_info table created');
}

export async function down() {
  await sql`
    DROP TABLE IF EXISTS company_info;
  `;
  console.log('❌ Dropped company_info table');
}
