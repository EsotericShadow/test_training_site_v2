// scripts/fix-hero-image.js
import mysql from 'mysql2/promise';
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
async function fixHeroImage() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Successfully connected to the database.');

    const newImageUrl = '/uploads/other/1750011620811-IMG_8439.JPG';

    const [result] = await connection.execute(
      'UPDATE hero_section SET background_image_url = ? WHERE id = 1',
      [newImageUrl]
    );

    if (result.affectedRows > 0) {
      console.log('Successfully updated the hero section background image URL.');
    } else {
      console.log('Could not find the hero_section record to update.');
    }

  } catch (error) {
    console.error('An error occurred during the update:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed.');
    }
  }
}

// --- Run the Script ---
fixHeroImage();
