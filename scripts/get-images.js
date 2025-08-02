import { db } from '../../lib/database.ts';
import { config } from 'dotenv';

config({ path: '.env.local' });

async function getImages() {
  try {
    const [rows] = await db.query(`
      SELECT * FROM files WHERE mime_type LIKE 'image/%'
    `);
    console.log(JSON.stringify(rows, null, 2));
  } catch (error) {
    console.error('Error fetching images:', error);
  }
}

getImages();
