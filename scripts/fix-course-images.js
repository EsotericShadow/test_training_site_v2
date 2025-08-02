// scripts/fix-course-images.js
import mysql from 'mysql2/promise';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: './.env.local' });

// --- Database Configuration ---
const dbConfig = {
  host: process.env.MYSQL_HOST,
  port: parseInt(process.env.MYSQL_PORT || '3307', 10),
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
};

// --- Main Update Logic ---
async function fixCourseImages() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Successfully connected to the database.');

    // 1. Get all available course images
    const courseImagesDir = path.join(process.cwd(), 'public', 'uploads', 'course-images');
    const availableImages = await fs.readdir(courseImagesDir);

    if (availableImages.length === 0) {
      console.log('No available images found in public/uploads/course-images. Cannot perform update.');
      return;
    }

    // 2. Get all courses that are using a placeholder image
    const [coursesToUpdate] = await connection.execute(
      'SELECT * FROM courses WHERE image_url LIKE "%placeholder%"'
    );

    if (coursesToUpdate.length === 0) {
      console.log('No courses with placeholder images found to update.');
      return;
    }

    console.log(`Found ${coursesToUpdate.length} courses with placeholder images to update.`);

    let imageIndex = 0;
    let updatedCount = 0;

    // 3. Loop through each course and assign a new image
    for (const course of coursesToUpdate) {
      // Cycle through available images
      if (imageIndex >= availableImages.length) {
        imageIndex = 0;
      }

      const newImageUrl = `/uploads/course-images/${availableImages[imageIndex]}`;

      await connection.execute(
        'UPDATE courses SET image_url = ? WHERE id = ?',
        [newImageUrl, course.id]
      );

      console.log(`  -> Updated course ID ${course.id} (${course.title}) with image: ${newImageUrl}`);
      updatedCount++;
      imageIndex++;
    }

    console.log('\n--- Course Image Update Complete ---');
    console.log(`Successfully updated ${updatedCount} course records.`);

  } catch (error) {
    console.error('\nAn error occurred during the update process:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nDatabase connection closed.');
    }
  }
}

// --- Run the Script ---
fixCourseImages();
