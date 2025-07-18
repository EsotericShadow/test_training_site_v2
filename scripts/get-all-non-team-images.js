import { sql } from '@vercel/postgres';
import { config } from 'dotenv';

config({ path: '.env.local' });

async function getAllNonTeamImages() {
  try {
    const { rows } = await sql`SELECT id, filename, blob_url, alt_text, category FROM files WHERE mime_type LIKE 'image/%' AND status = 'active' AND category != 'team-photos' ORDER BY uploaded_at DESC`;
    console.log('Available Non-Team Images in Database:', JSON.stringify(rows, null, 2));
  } catch (error) {
    console.error('Error fetching non-team images from database:', error);
  }
}

getAllNonTeamImages();
