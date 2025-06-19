// Fixed version of src/app/page.tsx

import { Metadata } from 'next';
import HeroSection from '@/app/components/home/hero-section';
import FeaturedCourses from '@/app/components/home/featured-courses';
import AboutSnippet from '@/app/components/home/about-snippet';

// Generate metadata for SEO (replaces NextSeo)
export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://test-training-site-v2-xjey.vercel.app';
  
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
      title: 'Industrial Safety Training | Karma Industrial Safety Trainings',
      description: 'Certified industrial safety training in Northwestern BC. WorkSafeBC-compliant courses, IVES operator certification, and custom safety solutions.',
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
    verification: {
      google: 'your-google-verification-code', // Replace with actual verification code
    },
  };
}

// Server component (no 'use client' directive)
export default function Home() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://test-training-site-v2-xjey.vercel.app';

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
      
      <div>
        <HeroSection />
        <FeaturedCourses />
        <AboutSnippet />
      </div>
    </>
  );
}

