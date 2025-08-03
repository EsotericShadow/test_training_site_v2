/*
 * Karma Industrial Safety Training Website
 * Written and developed by Gabriel Lacroix for Evergreen Web Solutions
 *
 * File: page.tsx
 * Description: Contact page server component that generates contact-focused SEO metadata
 *              and renders the contact page with structured data for enhanced local search
 *              visibility and contact information accessibility.
 * Dependencies: Next.js 15, React 19, custom ContactPageClient component
 * Created: June 3, 2025
 * Last Modified: August 3, 2025
 * Version: 1.0.0
 */
// Fixed version of src/app/contact/page.tsx

import { Metadata } from 'next';
import ContactPageClient from './ContactPageClient';

/**
 * Generates contact page metadata optimized for local search and contact discovery
 * 
 * WHY: Contact page metadata is crucial for local SEO and helps potential customers
 *      find contact information through search engines and social media
 * 
 * HOW: Creates metadata emphasizing contact methods, response times, and local service
 *      area with proper format detection for phone numbers and email addresses
 * 
 * WHAT: Returns metadata focused on contact accessibility and local business presence
 * 
 * @returns {Promise<Metadata>} Contact-optimized metadata for local search
 */
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

/**
 * Contact page server component that renders contact information with structured data
 * 
 * WHY: Server-side rendering ensures contact information is immediately available
 *      and properly indexed by search engines for local business discovery
 * 
 * HOW: Generates comprehensive JSON-LD structured data for business contact information
 *      and renders the client component for interactive contact functionality
 * 
 * WHAT: Returns complete contact page with structured data for enhanced local SEO
 * 
 * @returns {JSX.Element} Complete contact page with structured business data
 */
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