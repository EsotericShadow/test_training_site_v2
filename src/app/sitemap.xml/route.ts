/*
 * Evergreen Web Solutions
 * Written and developed by Gabriel Lacroix
 *
 * File: route.ts
 * Description: To be filled in with the script's purpose
 * Dependencies: To be filled in with key dependencies or modules
 * Created: August 2, 2025
 * Last Modified: August 2, 2025
 * Version: 1.0.0
 */
// src/app/sitemap.xml/route.ts
import { NextResponse } from 'next/server';
import { coursesOps, Course } from '../../../lib/database'; // Use relative import to avoid alias issue
import { logger } from '../../../lib/logger';

interface SitemapPage {
  url: string;
  lastModified: Date;
  changefreq: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'always' | 'hourly' | 'never';
  priority: number;
}

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
    const staticPages: SitemapPage[] = [
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
    const coursePages: SitemapPage[] = courses
      .filter((course: Course) => course.slug && typeof course.slug === 'string')
      .map((course: Course): SitemapPage => ({
        url: `${baseUrl}/courses/${course.slug}`,
        lastModified: course.updated_at ? new Date(course.updated_at) : new Date(),
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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const stack = error instanceof Error ? error.stack : 'No stack trace';
    logger.error('Sitemap generation error', { message, stack });
    return new NextResponse('Internal Server Error', { status: 500 });
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
//                           \/                                       \/     \/                 