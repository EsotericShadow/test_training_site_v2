import { db } from '../../lib/database.ts';

export async function up() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS admin_sessions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      token VARCHAR(255) UNIQUE NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
      ip_address VARCHAR(255),
      user_agent TEXT,
      FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE
    );
  `);
  console.log('✅ admin_sessions table created');
}

export async function down() {
  await db.query(`
    DROP TABLE IF EXISTS admin_sessions;
  `);
  console.log('❌ Dropped admin_sessions table');
}
