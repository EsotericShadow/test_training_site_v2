import { db } from '../../lib/database.ts';

export async function up() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS company_values (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      icon VARCHAR(255),
      display_order INT DEFAULT 0
    );
  `);
  console.log('✅ company_values table created');
}

export async function down() {
  await db.query(`
    DROP TABLE IF EXISTS company_values;
  `);
  console.log('❌ Dropped company_values table');
}
