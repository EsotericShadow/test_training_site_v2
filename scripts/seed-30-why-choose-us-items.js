/*
 * Evergreen Web Solutions
 * Written and developed by Gabriel Lacroix
 *
 * File: seed-30-why-choose-us-items.js
 * Description: To be filled in with the script's purpose
 * Dependencies: To be filled in with key dependencies or modules
 * Created: August 2, 2025
 * Last Modified: August 2, 2025
 * Version: 1.0.0
 */
import { sql } from '@vercel/postgres';
import { config } from 'dotenv';

config({ path: '.env.local' });

async function seedWhyChooseUsItems() {
  try {
    console.log('Starting seeding of 30 Why Choose Us items...');

    // 1. Clear existing data
    await sql`DELETE FROM company_why_choose_us`;
    console.log('Cleared existing company_why_choose_us data.');

    // 2. Fetch all non-team images
    // Define the original 6 Why Choose Us points
    const originalWhyChooseUs = [
      { point: 'Expert instructors with 70+ years combined experience' },
      { point: 'Comprehensive syllabus covering 14+ safety topics' },
      { point: 'Official KIST & IVES certification upon completion' },
      { point: 'Tailored for Northwestern BC industries' },
      { point: 'Flexible scheduling and on-site training options' },
      { point: '2000+ students trained since 2017' },
    ];

    // 1. Clear existing data
    await sql`DELETE FROM company_why_choose_us`;
    console.log('Cleared existing company_why_choose_us data.');

    // 2. Fetch all non-team images
    const { rows: images } = await sql`
      SELECT blob_url, alt_text 
      FROM files 
      WHERE mime_type LIKE 'image/%' AND status = 'active' 
      AND (category = 'course-images' OR category = 'other') 
      ORDER BY uploaded_at DESC
    `;

    if (images.length === 0) {
      console.error('No suitable images found in the database. Cannot seed Why Choose Us items.');
      return;
    }

    // Shuffle images to maximize variety before repetition
    const shuffledImages = [...images];
    for (let i = shuffledImages.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledImages[i], shuffledImages[j]] = [shuffledImages[j], shuffledImages[i]];
    }

    let imageIndex = 0;
    let displayOrder = 0;
    const createdItems = [];

    // Insert original Why Choose Us points first
    for (const originalItem of originalWhyChooseUs) {
      const image = shuffledImages[imageIndex];
      const result = await sql`
        INSERT INTO company_why_choose_us (point, display_order, image_url, image_alt) 
        VALUES (${originalItem.point}, ${displayOrder}, ${image.blob_url}, ${image.alt_text})
        RETURNING id;
      `;
      createdItems.push(result.rows[0].id);
      console.log(`Created original item ${displayOrder + 1}: ${originalItem.point} with image ${image.blob_url}`);
      imageIndex = (imageIndex + 1) % shuffledImages.length;
      displayOrder++;
    }

    

    console.log(`Successfully seeded ${createdItems.length} Why Choose Us items.`);
  } catch (error) {
    console.error('Error seeding Why Choose Us items:', error);
  }
}

seedWhyChooseUsItems();
