import { db } from '../../lib/database.ts';

export async function up() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS file_folders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      description TEXT,
      parent_id INT REFERENCES file_folders(id) ON DELETE SET NULL,
      display_order INT DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `);
  console.log('✅ file_folders table created');

  await db.query(`
    CREATE TABLE IF NOT EXISTS files (
      id INT AUTO_INCREMENT PRIMARY KEY,
      filename VARCHAR(255) NOT NULL,
      original_name VARCHAR(255) NOT NULL,
      file_size INT NOT NULL,
      mime_type VARCHAR(255) NOT NULL,
      file_extension VARCHAR(255) NOT NULL,
      file_url TEXT NOT NULL,
      width INT,
      height INT,
      aspect_ratio VARCHAR(255),
      alt_text TEXT,
      title TEXT,
      description TEXT,
      tags TEXT,
      caption TEXT,
      folder_id INT REFERENCES file_folders(id) ON DELETE SET NULL,
      category VARCHAR(255) DEFAULT 'general',
      is_featured BOOLEAN DEFAULT FALSE,
      status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'deleted', 'archived')),
      usage_count INT DEFAULT 0,
      uploaded_by INT REFERENCES admin_users(id) ON DELETE SET NULL,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `);
  console.log('✅ files table created');

  // Insert default folders idempotently
  const defaultFolders = [
    { name: 'General', description: 'General purpose files', display_order: 1 },
    { name: 'Images', description: 'Image files', display_order: 2 },
    { name: 'Documents', description: 'Document files', display_order: 3 },
    { name: 'Videos', description: 'Video files', display_order: 4 }
  ];

  for (const folder of defaultFolders) {
    const [existingFolderRows] = await db.query(`SELECT id FROM file_folders WHERE name = ?`, [folder.name]);
    if (existingFolderRows.length === 0) {
      await db.query(`
        INSERT INTO file_folders (name, description, display_order)
        VALUES (?, ?, ?)
      `, [folder.name, folder.description, folder.display_order]);
      console.log(`✅ Inserted default folder: ${folder.name}`);
    } else {
      console.log(`ℹ️ Default folder already exists: ${folder.name}`);
    }
  }
}

export async function down() {
  await db.query(`
    DROP TABLE IF EXISTS files;
  `);
  console.log('❌ Dropped files table');

  await db.query(`
    DROP TABLE IF EXISTS file_folders;
  `);
  console.log('❌ Dropped file_folders table');
}
