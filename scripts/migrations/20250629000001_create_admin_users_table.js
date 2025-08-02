import { db } from '../../lib/database.ts';

export async function up() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      email VARCHAR(255),
      role ENUM('admin', 'webmaster') NOT NULL DEFAULT 'admin',
      force_password_change BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login DATETIME,
      token_version INT DEFAULT 0
    );
  `);
  console.log('✅ Created admin_users table');
}

export async function down() {
  await db.query(`
    DROP TABLE IF EXISTS admin_users;
  `);
  console.log('❌ Dropped admin_users table');
}
