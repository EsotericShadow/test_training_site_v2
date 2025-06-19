// Fixed version of src/app/courses/page.tsx

import { Metadata } from 'next';
import CoursesPageClient from './CoursesPageClient';

// Generate metadata for SEO (replaces NextSeo)
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

// Server component wrapper
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

