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

    const targetCount = 30;
    let imageIndex = 0;
    const createdItems = [];

    for (let i = 0; i < targetCount; i++) {
      const image = images[imageIndex];
      const pointText = `Why Choose Us Point ${i + 1}`;

      const result = await sql`
        INSERT INTO company_why_choose_us (point, display_order, image_url, image_alt) 
        VALUES (${pointText}, ${i}, ${image.blob_url}, ${image.alt_text})
        RETURNING id;
      `;
      createdItems.push(result.rows[0].id);
      console.log(`Created item ${i + 1}: ${pointText} with image ${image.blob_url}`);

      imageIndex = (imageIndex + 1) % images.length; // Cycle through images
    }

    console.log(`Successfully seeded ${createdItems.length} Why Choose Us items.`);
  } catch (error) {
    console.error('Error seeding Why Choose Us items:', error);
  }
}

seedWhyChooseUsItems();
