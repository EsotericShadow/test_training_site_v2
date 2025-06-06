import { NextResponse } from 'next/server';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { adminSessionsOps } from '../../../../../lib/database';

// Disable Next.js body parsing for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

// POST - Upload image file
export async function POST(request) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized: Missing or invalid token' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const session = await adminSessionsOps.getByToken(token);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid or expired token' },
        { status: 401 }
      );
    }

    // Parse form data
    const form = formidable({
      uploadDir: path.join(process.cwd(), 'public/uploads'),
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB limit
      multiples: false,
      filter: ({ mimetype }) => {
        // Allow only images
        return mimetype && mimetype.startsWith('image/');
      },
    });

    // Ensure upload directories exist
    const contentTypes = ['team-members', 'testimonials'];
    for (const type of contentTypes) {
      const dir = path.join(process.cwd(), `public/uploads/${type}`);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }

    // Parse the request
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(request, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    // Validate content type
    const contentType = fields.contentType?.[0];
    if (!contentType || !contentTypes.includes(contentType)) {
      return NextResponse.json(
        { error: 'Invalid content type. Must be "team-members" or "testimonials"' },
        { status: 400 }
      );
    }

    // Validate file
    const file = files.file?.[0];
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.originalFilename || 'upload';
    const extension = path.extname(originalName);
    const filename = `${timestamp}-${originalName.replace(extension, '')}${extension}`;
    const newPath = path.join(process.cwd(), `public/uploads/${contentType}`, filename);

    // Move file to correct directory
    fs.renameSync(file.filepath, newPath);

    // Generate public URL
    const fileUrl = `/uploads/${contentType}/${filename}`;

    return NextResponse.json({
      success: true,
      fileUrl,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}