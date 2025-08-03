/*
 * Karma Industrial Safety Training Website
 * Written and developed by Gabriel Lacroix for Evergreen Web Solutions
 *
 * File: page.tsx
 * Description: Courses listing page server component that generates course-focused SEO metadata
 *              and renders the courses overview page with structured data for enhanced course
 *              discovery and educational content organization.
 * Dependencies: Next.js 15, React 19, custom CoursesPageClient component
 * Created: June 3, 2025
 * Last Modified: August 3, 2025
 * Version: 1.0.0
 */
// Fixed version of src/app/courses/page.tsx

import { Metadata } from 'next';
import CoursesPageClient from './CoursesPageClient';

/**
 * Generates courses page metadata optimized for educational content discovery
 * 
 * WHY: Course listing metadata helps potential students discover training programs
 *      through search engines and establishes educational authority
 * 
 * HOW: Creates metadata emphasizing course variety, compliance standards, and
 *      educational outcomes with industry-specific keywords
 * 
 * WHAT: Returns metadata focused on course catalog and educational offerings
 * 
 * @returns {Promise<Metadata>} Course-optimized metadata for educational search
 */
export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://test-training-site-v2-xjey.vercel.app';
  
  return {
    title: 'Safety Training Courses | Karma Industrial Safety Trainings',
    description: 'Explore WorkSafeBC-compliant safety training courses in Northwestern BC, including Fall Protection, WHMIS, and IVES operator certification. Expert instructors, flexible scheduling.',
    keywords: ['safety training courses', 'WorkSafeBC compliant', 'Fall Protection', 'WHMIS', 'IVES certification', 'Northwestern BC', 'industrial safety', 'workplace safety'],
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
      canonical: '/courses',
    },
    openGraph: {
      title: 'Safety Training Courses | Karma Industrial Safety Trainings',
      description: 'Explore WorkSafeBC-compliant safety training courses in Northwestern BC, including Fall Protection, WHMIS, and IVES operator certification.',
      url: '/courses',
      siteName: 'Karma Industrial Safety Trainings',
      images: [
        {
          url: '/assets/logos/logo.png',
          width: 600,
          height: 315,
          alt: 'Karma Industrial Safety Trainings Logo',
          type: 'image/png',
        },
      ],
      locale: 'en_CA',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Safety Training Courses | Karma Industrial Safety Trainings',
      description: 'Explore WorkSafeBC-compliant safety training courses in Northwestern BC, including Fall Protection, WHMIS, and IVES operator certification.',
      site: '@KarmaTraining',
      images: ['/assets/logos/logo.png'],
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
  };
}

/**
 * Courses page server component that renders course catalog with educational structured data
 * 
 * WHY: Server-side rendering ensures course information is immediately available
 *      and properly structured for educational content indexing
 * 
 * HOW: Generates comprehensive JSON-LD structured data for educational organization
 *      and course catalog information for enhanced search visibility
 * 
 * WHAT: Returns complete courses page with structured educational data
 * 
 * @returns {JSX.Element} Complete courses page with educational structured data
 */
export default function CoursesPage() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://test-training-site-v2-xjey.vercel.app';

  // JSON-LD structured data for courses page
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'Karma Industrial Safety Trainings',
    url: `${baseUrl}/`,
    description: 'WorkSafeBC-compliant safety training courses in Northwestern BC, including Fall Protection, WHMIS, and IVES operator certification.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Northwestern British Columbia',
      addressRegion: 'BC',
      addressCountry: 'CA',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-250-615-3727',
      contactType: 'Customer Service',
      email: 'info@karmatraining.ca',
      areaServed: 'CA-BC',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Safety Training Courses',
      itemListElement: [
        {
          '@type': 'Course',
          name: 'Fall Protection Training',
          description: 'Comprehensive fall protection training for workers at height',
          provider: {
            '@type': 'Organization',
            name: 'Karma Industrial Safety Trainings',
          },
        },
        {
          '@type': 'Course',
          name: 'WHMIS Training',
          description: 'Workplace Hazardous Materials Information System training',
          provider: {
            '@type': 'Organization',
            name: 'Karma Industrial Safety Trainings',
          },
        },
        {
          '@type': 'Course',
          name: 'IVES Operator Certification',
          description: 'Industrial Vacuum Excavation System operator certification',
          provider: {
            '@type': 'Organization',
            name: 'Karma Industrial Safety Trainings',
          },
        },
      ],
    },
    sameAs: [
      // Add social media URLs here when available
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
      
      {/* Client component for interactive functionality */}
      <CoursesPageClient />
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
//                           \/                                       \/     \/                 