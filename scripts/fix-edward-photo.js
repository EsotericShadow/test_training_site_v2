// scripts/fix-edward-photo.js
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
async function fixEdwardPhoto() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Successfully connected to the database.');

    const newPhotoUrl = '/uploads/team-photos/1752447833026-Ed_1.webp';

    const [result] = await connection.execute(
      'UPDATE team_members SET photo_url = ? WHERE name = ?',
      [newPhotoUrl, 'Edward']
    );

    if (result.affectedRows > 0) {
      console.log('Successfully updated the photo URL for Edward.');
    } else {
      console.log('Could not find a team member named Edward to update.');
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
fixEdwardPhoto();
