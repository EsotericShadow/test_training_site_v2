// src/app/api/privacy/hero-image/route.ts
import { NextResponse } from 'next/server';
import { filesOps } from '../../../../../lib/database';

export async function GET() {
  try {
    const files = await filesOps.getByCategory('other');
    if (files.length > 0) {
      const randomIndex = Math.floor(Math.random() * files.length);
      return NextResponse.json({ file: files[randomIndex] });
    } else {
      return NextResponse.json({ error: 'No files found for this category' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch files' },
      { status: 500 }
    );
  }
}
