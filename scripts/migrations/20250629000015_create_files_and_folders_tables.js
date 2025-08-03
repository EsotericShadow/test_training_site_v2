/*
 * Evergreen Web Solutions
 * Written and developed by Gabriel Lacroix
 *
 * File: 20250629000015_create_files_and_folders_tables.js
 * Description: To be filled in with the script's purpose
 * Dependencies: To be filled in with key dependencies or modules
 * Created: August 2, 2025
 * Last Modified: August 2, 2025
 * Version: 1.0.0
 */
import { sql } from '@vercel/postgres';

export async function up() {
  await sql`
    CREATE TABLE IF NOT EXISTS file_folders (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      parent_id INTEGER REFERENCES file_folders(id) ON DELETE SET NULL,
      display_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  console.log('✅ file_folders table created');

  await sql`
    CREATE TABLE IF NOT EXISTS files (
      id SERIAL PRIMARY KEY,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      mime_type TEXT NOT NULL,
      file_extension TEXT NOT NULL,
      blob_url TEXT NOT NULL,
      blob_pathname TEXT NOT NULL,
      blob_token TEXT NOT NULL,
      width INTEGER,
      height INTEGER,
      aspect_ratio TEXT,
      alt_text TEXT,
      title TEXT,
      description TEXT,
      tags TEXT,
      caption TEXT,
      folder_id INTEGER REFERENCES file_folders(id) ON DELETE SET NULL,
      category TEXT DEFAULT 'general',
      is_featured BOOLEAN DEFAULT FALSE,
      status TEXT DEFAULT 'active' CHECK (status IN ('active', 'deleted', 'archived')),
      usage_count INTEGER DEFAULT 0,
      uploaded_by INTEGER REFERENCES admin_users(id) ON DELETE SET NULL,
      uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  console.log('✅ files table created');

  // Insert default folders idempotently
  const defaultFolders = [
    { name: 'General', description: 'General purpose files', display_order: 1 },
    { name: 'Images', description: 'Image files', display_order: 2 },
    { name: 'Documents', description: 'Document files', display_order: 3 },
    { name: 'Videos', description: 'Video files', display_order: 4 }
  ];

  for (const folder of defaultFolders) {
    const existingFolder = await sql`SELECT id FROM file_folders WHERE name = ${folder.name}`;
    if (existingFolder.rows.length === 0) {
      await sql`
        INSERT INTO file_folders (name, description, display_order)
        VALUES (${folder.name}, ${folder.description}, ${folder.display_order})
      `;
      console.log(`✅ Inserted default folder: ${folder.name}`);
    } else {
      console.log(`ℹ️ Default folder already exists: ${folder.name}`);
    }
  }
}

export async function down() {
  await sql`
    DROP TABLE IF EXISTS files;
  `;
  console.log('❌ Dropped files table');

  await sql`
    DROP TABLE IF EXISTS file_folders;
  `;
  console.log('❌ Dropped file_folders table');
}
