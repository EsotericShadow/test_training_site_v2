// Fixed version of src/app/contact/page.tsx

import { Metadata } from 'next';
import ContactPageClient from './ContactPageClient';

// Generate metadata for SEO (replaces NextSeo)
export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://test-training-site-v2-xjey.vercel.app';
  
  return {
    title: 'Contact Us | Karma Industrial Safety Trainings',
    description: 'Contact Karma Industrial Safety Trainings for safety training in Northwestern BC. Call (250) 615-3727 or email info@karmatraining.ca. 24-hour response guarantee.',
    keywords: ['contact', 'safety training', 'Northwestern BC', 'WorkSafeBC', 'industrial safety', 'training consultation'],
    authors: [{ name: 'Karma Industrial Safety Trainings' }],
    creator: 'Karma Industrial Safety Trainings',
    publisher: 'Karma Industrial Safety Trainings',
    formatDetection: {
      email: true,
      address: true,
      telephone: true,
    },
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: '/contact',
    },
    openGraph: {
      title: 'Contact Us | Karma Industrial Safety Trainings',
      description: 'Contact Karma Industrial Safety Trainings for safety training in Northwestern BC. Call (250) 615-3727 or email info@karmatraining.ca. 24-hour response guarantee.',
      url: '/contact',
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
      title: 'Contact Us | Karma Industrial Safety Trainings',
      description: 'Contact Karma Industrial Safety Trainings for safety training in Northwestern BC. Call (250) 615-3727 or email info@karmatraining.ca.',
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
export default function ContactPage() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://test-training-site-v2-xjey.vercel.app';

  // JSON-LD structured data for contact page
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Karma Industrial Safety Trainings',
    url: `${baseUrl}/`,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-250-615-3727',
      contactType: 'Customer Service',
      email: 'info@karmatraining.ca',
      areaServed: 'CA-BC',
      availableLanguage: 'English',
      hoursAvailable: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '17:00',
      },
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Northwestern British Columbia',
      addressRegion: 'BC',
      addressCountry: 'CA',
    },
    description: 'Contact Karma Industrial Safety Trainings for WorkSafeBC-compliant safety training and IVES operator certification in Northwestern BC.',
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
      <ContactPageClient />
    </>
  );
}

