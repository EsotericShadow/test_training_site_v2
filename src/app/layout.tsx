import Script from 'next/script';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/app/components/layout/header';
import Footer from '@/app/components/layout/footer';
import { ThemeProvider } from './components/theme/smart-theme-provider';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const DynamicSilk = dynamic(() => import('@/app/components/ui/Silk'));

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

async function getCourseCategories(): Promise<CourseCategories> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://test-training-site-v2-xjey.vercel.app';
    const response = await fetch(`${baseUrl}/api/adm_f7f8556683f1cdc65391d8d2_8e91/courses`, { cache: 'no-store' });
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

async function getFooterData(): Promise<FooterData> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://test-training-site-v2-xjey.vercel.app';
    const response = await fetch(`${baseUrl}/api/adm_f7f556683f1cdc65391d8d2_8e91/footer`, { cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to fetch footer data');
    const data = await response.json();
    return { footerContent: data.footerContent, popularCourses: data.popularCourses || [] };
  } catch (error) {
    console.error('Error fetching footer data:', error);
    return { footerContent: null, popularCourses: [] };
  }
}

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