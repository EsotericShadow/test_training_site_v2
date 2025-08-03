/*
 * Karma Industrial Safety Training Website
 * Written and developed by Gabriel Lacroix for Evergreen Web Solutions
 *
 * File: scripts/get-all-images.js
 * Description: Retrieves all active course and other images from the database.
 * Dependencies: @vercel/postgres
 * Created: 2025-07-17
 * Last Modified: 2025-08-02
 * Version: 1.0.1
 */
import { sql } from '@vercel/postgres';
import { config } from 'dotenv';

config({ path: '.env.local' });

async function getAllImages() {
  try {
    const { rows } = await sql`SELECT id, filename, blob_url, alt_text FROM files WHERE mime_type LIKE 'image/%' AND status = 'active' AND (category = 'course-images' OR category = 'other') ORDER BY uploaded_at DESC`;
    console.log('Available Images in Database:', JSON.stringify(rows, null, 2));
  } catch (error) {
    console.error('Error fetching images from database:', error);
  }
}

getAllImages();
