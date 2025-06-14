// Files Management Database Migration
// Run this script to add file management tables to your existing database

import { config } from 'dotenv';
config({ path: '.env.local' });

import { createPool } from '@vercel/postgres';

console.log('Starting files management database migration...');

const pool = createPool({
  connectionString: process.env.POSTGRES_URL
});

async function addFilesTables() {
  try {
    console.log('🔗 Connecting to database...');
    
    // Test the connection first
    const testResult = await pool.sql`SELECT NOW() as current_time`;
    console.log('✅ Database connection successful:', testResult.rows[0].current_time);

    // Files main table
    await pool.sql`
      CREATE TABLE IF NOT EXISTS files (
        id SERIAL PRIMARY KEY,
        
        -- Core File Information
        filename TEXT NOT NULL,
        original_name TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        mime_type TEXT NOT NULL,
        file_extension TEXT NOT NULL,
        
        -- Vercel Blob Integration
        blob_url TEXT NOT NULL UNIQUE,
        blob_pathname TEXT NOT NULL,
        blob_token TEXT,
        
        -- Image-Specific Metadata
        width INTEGER,
        height INTEGER,
        aspect_ratio DECIMAL(10,4),
        
        -- SEO & Content Management
        alt_text TEXT,
        title TEXT,
        description TEXT,
        tags TEXT, -- JSON array as text or comma-separated
        caption TEXT,
        
        -- Organization & Usage
        folder_id INTEGER,
        category TEXT DEFAULT 'general',
        usage_count INTEGER DEFAULT 0,
        is_featured BOOLEAN DEFAULT FALSE,
        
        -- User & System Tracking
        uploaded_by INTEGER,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
        
        -- Indexes for performance
        CONSTRAINT files_category_check CHECK (category IN ('general', 'team-photos', 'course-images', 'testimonials', 'company', 'other'))
      )
    `;
    console.log('✅ files table created');

    // File folders table (optional organization)
    await pool.sql`
      CREATE TABLE IF NOT EXISTS file_folders (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        parent_id INTEGER REFERENCES file_folders(id),
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ file_folders table created');

    // Create indexes for better performance
    await pool.sql`
      CREATE INDEX IF NOT EXISTS idx_files_category ON files(category);
    `;
    await pool.sql`
      CREATE INDEX IF NOT EXISTS idx_files_uploaded_at ON files(uploaded_at DESC);
    `;
    await pool.sql`
      CREATE INDEX IF NOT EXISTS idx_files_status ON files(status);
    `;
    await pool.sql`
      CREATE INDEX IF NOT EXISTS idx_files_mime_type ON files(mime_type);
    `;
    console.log('✅ Database indexes created');

    // Insert default folders
    await insertDefaultFolderData();

    console.log('🎉 Files management database migration complete!');
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error creating files tables:', err);
    await pool.end();
    process.exit(1);
  }
}

async function insertDefaultFolderData() {
  try {
    // Insert default folders if none exist
    const existingFolders = await pool.sql`SELECT COUNT(*) as count FROM file_folders`;
    if (existingFolders.rows[0].count === '0') {
      await pool.sql`
        INSERT INTO file_folders (name, description, display_order) VALUES
        ('Team Photos', 'Photos of team members and staff', 1),
        ('Course Images', 'Images related to training courses', 2),
        ('Company Assets', 'Logos, branding, and company materials', 3),
        ('Testimonial Photos', 'Client and testimonial related images', 4),
        ('General', 'Miscellaneous files and images', 5)
      `;
      console.log('✅ Default file folders created');
    }

  } catch (error) {
    console.error('❌ Error inserting default folder data:', error);
    throw error;
  }
}

addFilesTables();

