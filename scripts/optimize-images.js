/*
 * Evergreen Web Solutions
 * Written and developed by Gabriel Lacroix
 *
 * File: optimize-images.js
 * Description: To be filled in with the script's purpose
 * Dependencies: To be filled in with key dependencies or modules
 * Created: August 2, 2025
 * Last Modified: August 2, 2025
 * Version: 1.0.0
 */
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

const inputDir = process.argv[2];
const outputDir = process.argv[3];

if (!inputDir || !outputDir) {
  console.error('Usage: node optimize-images.js <inputDirectory> <outputDirectory>');
  process.exit(1);
}

async function optimizeImagesInDirectory(inputPath, outputPath) {
  try {
    await fs.mkdir(outputPath, { recursive: true });
    const files = await fs.readdir(inputPath);

    for (const file of files) {
      const inputFile = path.join(inputPath, file);
      const outputFile = path.join(outputPath, `${path.parse(file).name}.webp`);

      const stats = await fs.stat(inputFile);
      if (stats.isFile()) {
        try {
          await sharp(inputFile)
            .resize({ width: 1920, withoutEnlargement: true }) // Max width, no upscale
            .webp({ quality: 75 }) // WebP at 75 quality
            .toFile(outputFile);
          console.log(`Optimized: ${inputFile} -> ${outputFile}`);
        } catch (error) {
          console.error(`Failed to optimize ${inputFile}:`, error);
        }
      }
    }
    console.log('All images processed.');
  } catch (error) {
    console.error('Error during image optimization:', error);
  }
}

optimizeImagesInDirectory(inputDir, outputDir);
