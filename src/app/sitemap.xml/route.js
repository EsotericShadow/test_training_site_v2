// src/app/sitemap.xml/route.js
import { NextResponse } from 'next/server';
import { coursesOps } from '../../../lib/database.js'; // Use relative import to avoid alias issue
import { logger } from '../../../lib/logger.js';

export async function GET() {
  try {
    // Ensure base URL is set
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://test-training-site-v2-xjey.vercel.app';
    if (!baseUrl) {
      throw new Error('NEXT_PUBLIC_BASE_URL is not defined');
    }

    // Fetch dynamic courses
    const courses = await coursesOps.getAll();

    // Static pages
    const staticPages = [
      {
        url: `${baseUrl}/`,
        lastModified: new Date(),
        changefreq: 'daily',
        priority: 1.0,
      },
      {
        url: `${baseUrl}/about`,
        lastModified: new Date(),
        changefreq: 'monthly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/contact`,
        lastModified: new Date(),
        changefreq: 'monthly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/courses`,
        lastModified: new Date(),
        changefreq: 'weekly',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/privacy`,
        lastModified: new Date(),
        changefreq: 'yearly',
        priority: 0.5,
      },
      {
        url: `${baseUrl}/terms`,
        lastModified: new Date(),
        changefreq: 'yearly',
        priority: 0.5,
      },
    ];

    // Dynamic course pages
    const coursePages = courses
      .filter((course) => course.slug && typeof course.slug === 'string')
      .map((course) => ({
        url: `${baseUrl}/courses/${course.slug}`,
        lastModified: course.updated_at || new Date(),
        changefreq: 'weekly',
        priority: 0.9,
      }));

    // Combine all pages
    const pages = [...staticPages, ...coursePages];

    // Generate sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${pages
    .map(
      (page) => `
    <url>
      <loc>${page.url}</loc>
      <lastmod>${new Date(page.lastModified).toISOString()}</lastmod>
      <changefreq>${page.changefreq}</changefreq>
      <priority>${page.priority}</priority>
    </url>
  `
    )
    .join('')}
</urlset>`;

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    });
  } catch (error) {
    logger.error('Sitemap generation error', { message: error.message, stack: error.stack });
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}