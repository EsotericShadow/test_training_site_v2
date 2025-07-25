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
