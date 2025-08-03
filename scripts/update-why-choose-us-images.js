/*
 * Evergreen Web Solutions
 * Written and developed by Gabriel Lacroix
 *
 * File: update-why-choose-us-images.js
 * Description: To be filled in with the script's purpose
 * Dependencies: To be filled in with key dependencies or modules
 * Created: August 2, 2025
 * Last Modified: August 2, 2025
 * Version: 1.0.0
 */
import { sql } from '@vercel/postgres';
import { config } from 'dotenv';

config({ path: '.env.local' });

async function updateWhyChooseUsImages() {
  try {
    console.log('Starting update of Why Choose Us images...');

    // Fetch all existing Why Choose Us entries
    const { rows: whyChooseUsItems } = await sql`SELECT id, point FROM company_why_choose_us ORDER BY display_order`;

    // Fetch a selection of image URLs and alt texts from the files table
    const { rows: images } = await sql`
      SELECT blob_url, alt_text 
      FROM files 
      WHERE mime_type LIKE 'image/%' AND status = 'active'
      AND (category = 'course-images' OR category = 'other')
      ORDER BY uploaded_at DESC
      LIMIT 5 -- Limit to a few images for rotation
    `;

    if (images.length === 0) {
      console.warn('No active images found in the database to assign. Skipping image update.');
      return;
    }

    let imageIndex = 0;
    for (const item of whyChooseUsItems) {
      const image = images[imageIndex];
      
      await sql`
        UPDATE company_why_choose_us
        SET image_url = ${image.blob_url},
            image_alt = ${image.alt_text}
        WHERE id = ${item.id}
      `;
      console.log(`Updated Why Choose Us item ID ${item.id} with image: ${image.blob_url}`);

      imageIndex = (imageIndex + 1) % images.length;
    }

    console.log('Successfully updated Why Choose Us items with images.');
  } catch (error) {
    console.error('Error updating Why Choose Us images:', error);
  }
}

updateWhyChooseUsImages();
