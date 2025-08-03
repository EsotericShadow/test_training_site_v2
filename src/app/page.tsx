/*
 * Karma Industrial Safety Training Website
 * Written and developed by Gabriel Lacroix for Evergreen Web Solutions
 *
 * File: page.tsx
 * Description: Main homepage server component that handles SEO metadata generation,
 *              fetches hero section data, and renders the home page with dynamic components.
 *              Includes JSON-LD structured data for search engine optimization.
 * Dependencies: Next.js 15, React 19, GSAP animations, dynamic imports
 * Created: June 3, 2025
 * Last Modified: August 3, 2025
 * Version: 1.0.0
 */
import { Metadata } from 'next';
import Image from 'next/image';
import DynamicFeaturedCourses from '@/app/components/home/DynamicFeaturedCourses';
import DynamicAboutSnippet from '@/app/components/home/DynamicAboutSnippet';
import { Suspense } from 'react';
import dynamicComponent from 'next/dynamic';

const DynamicHeroSection = dynamicComponent(() => import('@/app/components/home/hero-section'));

export const dynamic = 'force-dynamic';

/**
 * Fetches hero section data from the API server-side for optimal performance
 * 
 * WHY: Server-side data fetching improves initial page load times and SEO by
 *      providing content during the initial HTML render rather than client-side hydration
 * 
 * HOW: Makes a fetch request to the internal API endpoint with cache disabled
 *      to ensure fresh data on each page load
 * 
 * WHAT: Returns hero section content, statistics, and features data with fallback
 *       values if the API call fails
 * 
 * @returns {Promise<Object>} Object containing heroSection, heroStats, and heroFeatures
 */
async function getHeroData() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/public-hero-section`, { cache: 'no-store' });
    
    if (response.ok) {
      const data = await response.json();
      return {
        heroSection: data.heroSection || {},
        heroStats: data.heroStats || [],
        heroFeatures: data.heroFeatures || []
      };
    }
  } catch (error) {
    console.error('Error fetching hero data:', error);
  }
  
  // Return fallback data if fetch fails
  return {
    heroSection: {},
    heroStats: [],
    heroFeatures: []
  };
}

/**
 * Generates comprehensive metadata for SEO optimization using Next.js 15 App Router
 * 
 * WHY: Proper metadata is crucial for search engine ranking, social media sharing,
 *      and user experience. Replaces the deprecated NextSeo component.
 * 
 * HOW: Dynamically generates metadata including OpenGraph, Twitter Cards, structured data,
 *      and performance optimization hints based on hero section data
 * 
 * WHAT: Returns a complete Metadata object with title, description, social media tags,
 *       verification codes, and preload hints for critical resources
 * 
 * @returns {Promise<Metadata>} Next.js metadata object for the page
 */
export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://test-training-site-v2-xjey.vercel.app';
  
  // Fetch hero data for potential image preloading
  const heroData = await getHeroData();
  const heroImage = heroData.heroSection.background_image_url;
  
  return {
    title: 'Industrial Safety Training | Karma Industrial Safety Trainings',
    description: 'Certified industrial safety training in Northwestern BC. WorkSafeBC-compliant courses, IVES operator certification, and custom safety solutions.',
    keywords: ['industrial safety training', 'WorkSafeBC', 'IVES certification', 'Northwestern BC', 'safety courses'],
    authors: [{ name: 'Karma Industrial Safety Trainings' }],
    creator: 'Karma Industrial Safety Trainings',
    publisher: 'Karma Industrial Safety Trainings',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: '/',
    },
    openGraph: {
      title: 'Industrial Safety Training | Karma Industrial Safety Trainings',
      description: 'Certified industrial safety training in Northwestern BC. WorkSafeBC-compliant courses, IVES operator certification, and custom safety solutions.',
      url: '/',
      siteName: 'Karma Industrial Safety Trainings',
      images: [
        {
          url: heroImage || '/assets/logos/logo.png',
          width: 1200,
          height: 630,
          alt: 'Karma Industrial Safety Trainings',
          type: 'image/png',
        },
      ],
      locale: 'en_CA',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Industrial Safety Training | Karma Industrial Safety Trainings',
      description: 'Certified industrial safety training in Northwestern BC. WorkSafeBC-compliant courses, IVES operator certification, and custom safety solutions.',
      site: '@KarmaTraining',
      images: [heroImage || '/assets/logos/logo.png'],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: 'your-google-verification-code', // Replace with actual verification code
    },
    // Add preload hints for critical resources
    other: heroImage
      ? { preload: `<${heroImage}>; rel=preload; as=image` }
      : {},
  };
}

/**
 * Main homepage server component that orchestrates the entire home page experience
 * 
 * WHY: Server components provide better performance by rendering on the server,
 *      reducing client-side JavaScript bundle size and improving Core Web Vitals
 * 
 * HOW: Fetches all necessary data server-side, generates structured data for SEO,
 *      and renders the page with Suspense boundaries for progressive loading
 * 
 * WHAT: Renders the complete homepage including hero section, featured courses,
 *       about snippet, and includes JSON-LD structured data for rich search results
 * 
 * @returns {Promise<JSX.Element>} The complete homepage JSX structure
 */
export default async function Home() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://test-training-site-v2-xjey.vercel.app';
  
  // Fetch hero data server-side
  const heroData = await getHeroData();
  const teamMembersRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/public-team-members`, { cache: 'no-store' });
  const { teamMembers } = await teamMembersRes.json();

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Karma Industrial Safety Trainings',
    url: `${baseUrl}/`,
    logo: `${baseUrl}/assets/logos/logo.png`,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-250-615-3727',
      contactType: 'Customer Service',
      email: 'info@karmatraining.ca',
      areaServed: 'CA-BC',
    },
    description: 'Karma Industrial Safety Trainings provides WorkSafeBC-compliant safety training and IVES operator certification in Northwestern BC.',
    foundingDate: '2017',
    slogan: 'We believe the choices you make today will define your tomorrow',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'CA',
      addressRegion: 'BC',
    },
    sameAs: [
      // Add social media URLs here
    ],
  };

  return (
    <>
      
      
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />
      
      <div className="relative text-white">
        {heroData.heroSection.background_image_url && (
          <Image
            src={heroData.heroSection.background_image_url}
            alt={heroData.heroSection.background_image_alt || 'Safety training session'}
            fill
            className="object-cover"
            priority
            fetchPriority="high"
          />
        )}
        <div className="absolute inset-0 bg-black opacity-60"></div>
        <Suspense fallback={<div className="h-96 flex items-center justify-center"><div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-yellow-400"></div></div>}>
          <DynamicHeroSection initialData={heroData} />
        </Suspense>
      </div>
      <Suspense fallback={<div className="h-96 flex items-center justify-center"><div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-yellow-400"></div></div>}>
        <DynamicFeaturedCourses />
      </Suspense>
      <Suspense fallback={<div className="h-96 flex items-center justify-center"><div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-yellow-400"></div></div>}>
        <DynamicAboutSnippet teamMembers={teamMembers} />
      </Suspense>
    </>
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
//                           \/ https://www.evergreenwebsolutions.ca  \/     \/                 