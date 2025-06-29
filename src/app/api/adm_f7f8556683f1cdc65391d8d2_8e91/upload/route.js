import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { validateSession } from '../../../../../lib/session-manager';
import { filesOps } from '../../../../../lib/database';
import { sanitizeInput, validateInput } from '../../../../../lib/security-utils';

// POST - Upload file to Vercel Blob
export async function POST(request) {
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

    const session = sessionResult.session;

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file');
    const category = formData.get('category') || 'general';
    const altText = formData.get('alt_text') || '';
    const title = formData.get('title') || '';
    const description = formData.get('description') || '';
    const tags = formData.get('tags') || '';
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

    const validationResult = validateInput.fileMetadata(sanitizedData);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: `Invalid file metadata: ${validationResult.error}` },
        { status: 400 }
      );
    }

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

    // Validate file size (5MB limit)
    const maxSize = 15 * 1024 * 1024; // 15MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 15MB' },
        { status: 400 }
      );
    }

    // Validate category
    const allowedCategories = ['general', 'team-photos', 'course-images', 'testimonials', 'company', 'other'];
    if (!allowedCategories.includes(validationResult.data.category)) {
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
    const blobPathname = `${validationResult.data.category}/${filename}`;

    try {
      // Upload to Vercel Blob
      const blob = await put(blobPathname, file, {
        access: 'public',
        addRandomSuffix: false,
      });

      // Get image dimensions if it's an image
      let width = null;
      let height = null;
      let aspectRatio = null;

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
      const fileData = {
        filename: filename,
        original_name: originalName,
        file_size: file.size,
        mime_type: file.type,
        file_extension: fileExtension,
        blob_url: blob.url,
        blob_pathname: blobPathname,
        blob_token: blob.pathname, // Store pathname for potential deletion
        width: width,
        height: height,
        aspect_ratio: aspectRatio,
        alt_text: validationResult.data.alt_text || originalName,
        title: validationResult.data.title || originalName,
        description: validationResult.data.description,
        tags: validationResult.data.tags,
        category: validationResult.data.category,
        is_featured: validationResult.data.is_featured,
        uploaded_by: session.user_id
      };

      const result = await filesOps.create(fileData);

      return NextResponse.json({
        success: true,
        file: {
          id: result.id,
          filename: filename,
          original_name: originalName,
          file_size: file.size,
          mime_type: file.type,
          blob_url: blob.url,
          category: validationResult.data.category,
          alt_text: validationResult.data.alt_text || originalName,
          title: validationResult.data.title || originalName,
          description: validationResult.data.description,
          tags: validationResult.data.tags,
          is_featured: validationResult.data.is_featured
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
export async function GET(request) {
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
      maxFileSize: 15 * 1024 * 1024, // 5MB
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

