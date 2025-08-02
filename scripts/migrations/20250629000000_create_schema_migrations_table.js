import { db } from '../../lib/database.ts';

export async function up() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('✅ Created schema_migrations table');
}

export async function down() {
  await db.query(`
    DROP TABLE IF EXISTS schema_migrations;
  `);
  console.log('❌ Dropped schema_migrations table');
}
