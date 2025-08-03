#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// New header template
const getNewHeader = (filename, description, dependencies) => `/*
 * Karma Industrial Safety Training Website
 * Written and developed by Gabriel Lacroix for Evergreen Web Solutions
 *
 * File: ${filename}
 * Description: ${description}
 * Dependencies: ${dependencies}
 * Created: June 3, 2025
 * Last Modified: August 3, 2025
 * Version: 1.0.0
 */`;

// File descriptions mapping
const fileDescriptions = {
  'AboutIcons.tsx': ['Icon component for About page UI elements. Provides SVG icons for features and contact information.', 'React 19, SVG components'],
  'AboutPageClient.tsx': ['Client-side About page component with team member profiles and company information display.', 'React 19, Next.js 15, dynamic imports'],
  'ContactIcons.tsx': ['Icon component for Contact page UI elements. Provides SVG icons for contact methods and forms.', 'React 19, SVG components'],
  'ContactPageClient.tsx': ['Client-side Contact page component with interactive contact form and information display.', 'React 19, Next.js 15, SecureContactForm component'],
  'CourseIcons.tsx': ['Icon component for Course pages UI elements. Provides SVG icons for course features and navigation.', 'React 19, SVG components'],
  'CoursesPageClient.tsx': ['Client-side Courses page component with course listing, filtering, and search functionality.', 'React 19, Next.js 15, course data fetching'],
  'CoursePageClient.tsx': ['Client-side individual Course page component with detailed course information and enrollment.', 'React 19, Next.js 15, course data management'],
  'ExpandedCoursePageClient.tsx': ['Extended course page component with comprehensive course details and interactive elements.', 'React 19, Next.js 15, advanced course features'],
  'LegalIcons.tsx': ['Icon component for legal pages UI elements. Provides SVG icons for privacy and terms content.', 'React 19, SVG components'],
  'LayoutIcons.tsx': ['Icon component for layout elements. Provides SVG icons for header, footer, and navigation.', 'React 19, SVG components'],
  'HomeIcons.tsx': ['Icon component for Home page UI elements. Provides SVG icons for hero section and features.', 'React 19, SVG components'],
  'Hero.tsx': ['Hero section component for page headers with background images and call-to-action elements.', 'React 19, Next.js Image'],
  'Silk.tsx': ['Background silk animation component providing dynamic visual effects for page backgrounds.', 'React 19, CSS animations'],
  'OptimizedLucideIcon.tsx': ['Optimized icon component wrapper for Lucide React icons with performance enhancements.', 'React 19, Lucide React'],
  'DynamicAboutSnippet.tsx': ['Dynamic about section component for homepage with team member highlights.', 'React 19, Next.js 15, team data'],
  'DynamicFeaturedCourses.tsx': ['Dynamic featured courses component for homepage with course highlights and links.', 'React 19, Next.js 15, course data'],
  'WhyChooseUsBento.tsx': ['Bento grid component showcasing company advantages and unique selling points.', 'React 19, CSS Grid'],
  'about-snippet.tsx': ['Static about snippet component for homepage with company overview information.', 'React 19, Next.js 15'],
  'featured-courses.tsx': ['Static featured courses component for homepage with highlighted course offerings.', 'React 19, Next.js 15'],
  'FileSelectionButton.tsx': ['Admin file selection button component for content management interface.', 'React 19, file upload handling'],
  'FileSelectionModal.tsx': ['Admin file selection modal component for media management and upload functionality.', 'React 19, modal management'],
  'IconPicker.tsx': ['Admin icon picker component for selecting icons in content management interface.', 'React 19, icon management']
};

// Function to update a single file
function updateFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const filename = path.basename(filePath);
    
    // Skip if already updated
    if (content.includes('Karma Industrial Safety Training Website')) {
      console.log(`✓ ${filename} already updated`);
      return;
    }
    
    // Find old header pattern
    const headerRegex = /\/\*[\s\S]*?\*\//;
    const match = content.match(headerRegex);
    
    if (!match) {
      console.log(`! ${filename} - No header found`);
      return;
    }
    
    // Get description for this file
    const fileInfo = fileDescriptions[filename];
    if (!fileInfo) {
      console.log(`! ${filename} - No description mapping found`);
      return;
    }
    
    const [description, dependencies] = fileInfo;
    const newHeader = getNewHeader(filename, description, dependencies);
    
    // Replace old header with new one
    const updatedContent = content.replace(headerRegex, newHeader);
    
    // Write back to file
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log(`✓ Updated ${filename}`);
    
  } catch (error) {
    console.error(`✗ Error updating ${filePath}:`, error.message);
  }
}

// Find all .tsx files
function findTsxFiles(dir) {
  const files = [];
  
  function traverse(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        traverse(fullPath);
      } else if (entry.name.endsWith('.tsx')) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

// Main execution
const srcDir = path.join(__dirname, 'src');
const tsxFiles = findTsxFiles(srcDir);

console.log(`Found ${tsxFiles.length} .tsx files`);
console.log('Updating headers...\n');

tsxFiles.forEach(updateFile);

console.log('\nHeader update complete!');
