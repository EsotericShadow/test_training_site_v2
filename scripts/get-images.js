import { sql } from '@vercel/postgres';
import { config } from 'dotenv';

config({ path: '.env.local' });

async function getImages() {
  try {
    const { rows } = await sql`
      SELECT * FROM files WHERE mime_type LIKE 'image/%'
    `;
    console.log(JSON.stringify(rows, null, 2));
  } catch (error) {
    console.error('Error fetching images:', error);
  }
}

getImages();
