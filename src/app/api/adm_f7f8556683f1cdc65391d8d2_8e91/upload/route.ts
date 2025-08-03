/*
 * Karma Industrial Safety Training Website
 * Written and developed by Gabriel Lacroix for Evergreen Web Solutions
 *
 * File: src/app/api/adm_f7f8556683f1cdc65391d8d2_8e91/upload/route.ts
 * Description: API route for handling file uploads to Vercel Blob storage, including authentication, validation, and metadata storage.
 * Dependencies: Next.js, @vercel/blob, session-manager, Vercel Postgres, security-utils
 * Created: 2025-06-06
 * Last Modified: 2025-08-03
 * Version: 1.0.2
 */
// src/app/api/adm_f7f8556683f1cdc65391d8d2_8e91/upload/route.ts
import { NextResponse, NextRequest } from 'next/server';

export const runtime = 'nodejs';
import { put } from '@vercel/blob';
import { validateSession } from '../../../../../lib/session-manager';
import { filesOps } from '../../../../../lib/database';
import type { File as DbFile } from '../../../../../types/database';
import { sanitizeInput, validateInput } from '../../../../../lib/security-utils';

// POST - Upload file to Vercel Blob
export async function POST(request: NextRequest) {
  try {
    // Verify authentication using the same method as middleware
    const token = request.cookies.get('admin_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized: No session token' },
        { status: 401 }
      );
    }

    // Use the same validateSession function as middleware
    const sessionResult = await validateSession(token, request);
    if (!sessionResult.valid) {
      return NextResponse.json(
        { error: `Unauthorized: ${sessionResult.reason}` },
        { status: 401 }
      );
    }

    const session = sessionResult.session!;

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const category = (formData.get('category') as string) || 'general';
    const altText = (formData.get('alt_text') as string) || '';
    const title = (formData.get('title') as string) || '';
    const description = (formData.get('description') as string) || '';
    const tags = (formData.get('tags') as string) || '';
    const isFeatured = formData.get('is_featured') === 'true';

    // Sanitize and validate input fields
    const sanitizedData = {
      category: sanitizeInput.text(category),
      alt_text: sanitizeInput.text(altText),
      title: sanitizeInput.text(title),
      description: sanitizeInput.text(description),
      tags: sanitizeInput.text(tags),
      is_featured: isFeatured,
    };

    const validationResult = validateInput.fileMetadata(sanitizedData) as { success: boolean; data?: Partial<DbFile>; error?: string };
    if (!validationResult.success) {
      return NextResponse.json(
        { error: `Invalid file metadata: ${validationResult.error}` },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data!;

    // Validate file
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'No file uploaded or invalid file' },
        { status: 400 }
      );
    }

    // Validate file type (images only for now)
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (15MB limit)
    const maxSize = 15 * 1024 * 1024; // 15MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 15MB' },
        { status: 400 }
      );
    }

    // Validate category
    const allowedCategories = ['general', 'team-photos', 'course-images', 'testimonials', 'company', 'other'];
    if (!allowedCategories.includes(validatedData.category as string)) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.name;
    const fileExtension = originalName.split('.').pop()?.toLowerCase() || '';
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}-${sanitizedName}`;
    const blobPathname = `${validatedData.category}/${filename}`;

    try {
      // Upload to Vercel Blob
      const blob = await put(blobPathname, file, {
        access: 'public',
        addRandomSuffix: false,
      });

      // Get image dimensions if it's an image
      const width: number | undefined = undefined;
      const height: number | undefined = undefined;
      const aspectRatio: number | undefined = undefined;

      if (file.type.startsWith('image/')) {
        try {
          // Create image to get dimensions
          // Note: Image processing code commented out for future use
          // const arrayBuffer = await file.arrayBuffer();
          // const buffer = Buffer.from(arrayBuffer);
          
          // For now, we'll set dimensions to null and add them later
          // Add image processing library like 'sharp' if needed
          // const sharp = require('sharp');
          // const metadata = await sharp(buffer).metadata();
          // width = metadata.width;
          // height = metadata.height;
          // aspectRatio = width && height ? width / height : null;
        } catch (error) {
          console.warn('Could not extract image dimensions:', error);
        }
      }

      // Store file metadata in database
      const fileData: Partial<DbFile> = {
        filename: filename,
        original_name: originalName,
        file_size: file.size,
        mime_type: file.type,
        file_extension: fileExtension,
        blob_url: blob.url,
        blob_pathname: blobPathname,
        blob_token: blob.pathname, // Store pathname for potential deletion
      };

      if (width !== undefined) fileData.width = width;
      if (height !== undefined) fileData.height = height;
      if (aspectRatio !== undefined) fileData.aspect_ratio = aspectRatio;
      if (validatedData.alt_text !== undefined) fileData.alt_text = validatedData.alt_text || originalName;
      if (validatedData.title !== undefined) fileData.title = validatedData.title || originalName;
      if (validatedData.description !== undefined) fileData.description = validatedData.description;
      if (validatedData.tags !== undefined) fileData.tags = validatedData.tags;
      if (validatedData.category !== undefined) fileData.category = validatedData.category;
      if (validatedData.is_featured !== undefined) fileData.is_featured = validatedData.is_featured;
      fileData.uploaded_by = session.user_id;

      const result = await filesOps.create(fileData as DbFile);

      return NextResponse.json({
        success: true,
        file: {
          id: result.id,
          filename: filename,
          original_name: originalName,
          file_size: file.size,
          mime_type: file.type,
          blob_url: blob.url,
          category: validatedData.category,
          alt_text: validatedData.alt_text || originalName,
          title: validatedData.title || originalName,
          description: validatedData.description,
          tags: validatedData.tags,
          is_featured: validatedData.is_featured
        },
        message: 'File uploaded successfully'
      });

    } catch (blobError) {
      console.error('Error uploading to Vercel Blob:', blobError);
      return NextResponse.json(
        { error: 'Failed to upload file to storage' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

// GET - Get upload status or file info (optional)
export async function GET(request: NextRequest) {
  try {
    // Verify authentication using the same method as middleware
    const token = request.cookies.get('admin_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized: No session token' },
        { status: 401 }
      );
    }

    // Use the same validateSession function as middleware
    const sessionResult = await validateSession(token, request);
    if (!sessionResult.valid) {
      return NextResponse.json(
        { error: `Unauthorized: ${sessionResult.reason}` },
        { status: 401 }
      );
    }

    // Return upload configuration
    return NextResponse.json({
      maxFileSize: 15 * 1024 * 1024, // 15MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      allowedCategories: ['team-photos', 'course-images', 'testimonials', 'company', 'other']
    });

  } catch (error) {
    console.error('Error getting upload info:', error);
    return NextResponse.json(
      { error: 'Failed to get upload information' },
      { status: 500 }
    );
  }
}


//   ___________       *Written and developed by Gabriel Lacroix*               __      ___.
//   \_   _____/__  __ ___________  ___________   ____   ____   ____   /  \    /  \ ____\_ |__  
//    |    __)_\  \/ // __ \_  __ \/ ___\_  __ \_/ __ \_/ __ \ /    \  \   \/\/   // __ \| __ \ 
//    |        \\   /\  ___/|  | \/ /_/  >  | \/\  ___/\  ___/|   |  \  \        /\  ___/| \_\ \
//   /_______  / \_/  \___  >__|  \___  /|__|    \___  >\___  >___|  /   \__/\  /  \___  >___  /
//           \/           \/     /_____/             \/     \/     \/         \/       \/    \/ 
//                     _________      .__          __  .__                                      
//                    /   _____/ ____ |  |  __ ___/  |_|__| ____   ____   ______                
//                    \_____  \ /  _ \|  | |  |  \   __\  |/  _ \ /    \ /  ___/                
//                    /        (  <_> )  |_|  |  /|  | |  (  <_> )   |  \\___ \                 
//                   /_______  /\____/|____/____/ |__| |__|\____/|___|  /____  >                
//                           \/ https://www.evergreenwebsolutions.ca  \/     \/                 