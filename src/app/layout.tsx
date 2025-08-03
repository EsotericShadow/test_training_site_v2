/*
 * Karma Industrial Safety Training Website
 * Written and developed by Gabriel Lacroix for Evergreen Web Solutions
 *
 * File: layout.tsx
 * Description: Root layout component that provides the HTML structure, theme provider,
 *              Google Analytics integration, and manages global layout including header,
 *              main content area, and footer with server-side data fetching.
 * Dependencies: Next.js 15, React 19, Vercel Analytics, custom theme provider, dynamic imports
 * Created: June 3, 2025
 * Last Modified: August 3, 2025
 * Version: 1.0.0
 */
import Script from 'next/script';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/app/components/layout/header';
import Footer from '@/app/components/layout/footer';
import { ThemeProvider } from './components/theme/smart-theme-provider';
import nextDynamic from 'next/dynamic';
import { Suspense } from 'react';

const DynamicSilk = nextDynamic(() => import('@/app/components/ui/Silk'));

import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

const inter = Inter({ subsets: ['latin'] });

// Your actual Google Analytics 4 Measurement ID
const GA_MEASUREMENT_ID = 'G-W6X7SX4VF0';

export const metadata: Metadata = {
  title: 'Karma Training - Premier Safety Training for Northwestern BC',
  description: 'Professional safety training courses including KIST Orientation, WHMIS, Fall Protection, and more. Serving Northwestern British Columbia with expert instruction and certification.',
  keywords: 'safety training, KIST, WHMIS, fall protection, Northwestern BC, workplace safety, certification',
};

export const dynamic = 'force-dynamic';

interface ApiCourse {
  title: string;
  slug: string;
  category?: {
    name: string;
  };
}

interface Course {
  name: string;
  slug: string;
}

interface CourseCategories {
  [key: string]: Course[];
}

interface FooterContent {
  company_name: string;
  description: string;
  phone: string;
  email: string;
  location: string;
  logo_url: string;
  copyright_text: string;
}

export interface PopularCourse {
  title: string;
  slug: string;
}

interface FooterData {
  footerContent: FooterContent | null;
  popularCourses: PopularCourse[];
}

/**
 * Fetches and organizes course data into categories for navigation menu structure
 * 
 * WHY: The header navigation requires organized course data to display categorized
 *      dropdown menus, improving user experience and content discoverability
 * 
 * HOW: Fetches courses from API, groups them by category, and sorts both categories
 *      and courses alphabetically for consistent navigation presentation
 * 
 * WHAT: Returns a structured object with category names as keys and arrays of
 *       course objects containing name and slug properties
 * 
 * @returns {Promise<CourseCategories>} Organized course data for navigation
 */
async function getCourseCategories(): Promise<CourseCategories> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://test-training-site-v2-xjey.vercel.app';
    const response = await fetch(`${baseUrl}/api/adm_f7f8556683f1cdc65391d8d2_8e91/courses`);
    if (!response.ok) throw new Error('Failed to fetch courses');
    const { courses }: { courses: ApiCourse[] } = await response.json();

    const groupedCourses = courses.reduce((acc: CourseCategories, course: ApiCourse) => {
      const categoryName = course.category?.name?.trim() || 'Uncategorized';
      if (!acc[categoryName]) acc[categoryName] = [];
      acc[categoryName].push({ name: course.title, slug: course.slug });
      return acc;
    }, {});

    const sortedCategories = Object.keys(groupedCourses)
      .sort((a, b) => a.localeCompare(b))
      .reduce((acc: CourseCategories, key: string) => {
        acc[key] = (groupedCourses[key] ?? []).sort((a: Course, b: Course) => a.name.localeCompare(b.name));
        return acc;
      }, {});

    return sortedCategories;
  } catch (error) {
    console.error('Error fetching course categories:', error);
    return {};
  }
}

/**
 * Fetches footer content and popular courses data for the site footer
 * 
 * WHY: Footer requires company information and popular course links that are
 *      managed through the CMS and need to be dynamically loaded
 * 
 * HOW: Makes API request to footer endpoint and returns structured data with
 *      fallback values if the request fails to ensure layout stability
 * 
 * WHAT: Returns footer content including company details and array of popular
 *       courses for footer navigation links
 * 
 * @returns {Promise<FooterData>} Footer content and popular courses data
 */
async function getFooterData(): Promise<FooterData> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://test-training-site-v2-xjey.vercel.app';
    const response = await fetch(`${baseUrl}/api/adm_f7f8556683f1cdc65391d8d2_8e91/footer`);
    if (!response.ok) throw new Error('Failed to fetch footer data');
    const data = await response.json();
    return { footerContent: data.footerContent, popularCourses: data.popularCourses || [] };
  } catch (error) {
    console.error('Error fetching footer data:', error);
    return { footerContent: null, popularCourses: [] };
  }
}

/**
 * Root layout component that wraps all pages with consistent structure and functionality
 * 
 * WHY: Provides the foundational HTML structure, global styling, analytics tracking,
 *      and shared components like header and footer across all pages
 * 
 * HOW: Fetches necessary data server-side, sets up HTML document structure with
 *      proper meta tags, integrates analytics, and renders shared layout components
 * 
 * WHAT: Returns the complete HTML document structure with theme provider, header,
 *       main content area, footer, and analytics integration
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Page content to render in main area
 * @returns {Promise<JSX.Element>} Complete HTML document structure
 */
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const courseCategories = await getCourseCategories();
  const footerData = await getFooterData();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Viewport meta tag for mobile responsiveness */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
        {/* Google Analytics 4 - Your actual tracking code */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="lazyOnload"
        />
        <Script id="google-analytics" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_title: document.title,
              page_location: window.location.href,
            });
          `}
        </Script>
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider>
          <div className="min-h-screen flex flex-col text-black dark:text-white transition-colors duration-300 relative z-0">
            <div className="fixed inset-0 z-[-1]">
              <Suspense fallback={<div className="bg-gray-900 w-full h-full" />}>
                <DynamicSilk color="#303E5A" />
              </Suspense>
            </div>
            <Header courseCategories={courseCategories} />
            <main className="flex-grow pt-24 relative z-10">
              {children}
            </main>
            <Footer footerContent={footerData.footerContent} popularCourses={footerData.popularCourses} />
          </div>
        </ThemeProvider>
        {/* Keep Vercel Analytics too - they work great together */}
        {process.env.NODE_ENV === 'production' && (
          <>
            <Analytics />
            <SpeedInsights />
          </>
        )}
      </body>
    </html>
  );
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