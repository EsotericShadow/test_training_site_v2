/*
 * Evergreen Web Solutions
 * Written and developed by Gabriel Lacroix
 *
 * File: get-images.js
 * Description: To be filled in with the script's purpose
 * Dependencies: To be filled in with key dependencies or modules
 * Created: August 2, 2025
 * Last Modified: August 2, 2025
 * Version: 1.0.0
 */
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
