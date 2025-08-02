import { db } from '../../lib/database.ts';

export async function up() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS company_info (
      id INT PRIMARY KEY,
      company_name VARCHAR(255) NOT NULL,
      slogan VARCHAR(255),
      description TEXT,
      mission TEXT,
      total_experience INT,
      students_trained_count INT,
      established_year INT,
      total_courses INT,
      phone VARCHAR(255),
      email VARCHAR(255),
      location VARCHAR(255),
      business_hours VARCHAR(255),
      response_time VARCHAR(255),
      service_area VARCHAR(255),
      emergency_availability VARCHAR(255),
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `);
  console.log('✅ company_info table created');
}

export async function down() {
  await db.query(`
    DROP TABLE IF EXISTS company_info;
  `);
  console.log('❌ Dropped company_info table');
}
