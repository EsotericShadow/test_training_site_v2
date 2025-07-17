import { Metadata } from 'next';
import AboutPageClient from './AboutPageClient';

export const dynamic = 'force-dynamic';

// Generate metadata for SEO (replaces NextSeo)
export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://test-training-site-v2-xjey.vercel.app';
  
  return {
    title: 'About Us | Karma Industrial Safety Trainings',
    description: 'Established in 2017, Karma Industrial Safety Trainings provides premier safety training programs in Northwestern BC. Over 70 years of combined experience, 2000+ students trained.',
    keywords: ['about karma training', 'safety training company', 'Northwestern BC', 'WorkSafeBC', 'industrial safety', 'KIST certified', 'IVES training', 'established 2017', 'experienced instructors'],
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
      canonical: '/about',
    },
    openGraph: {
      title: 'About Us | Karma Industrial Safety Trainings',
      description: 'Established in 2017, Karma Industrial Safety Trainings provides premier safety training programs in Northwestern BC. Over 70 years of combined experience, 2000+ students trained.',
      url: '/about',
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
      title: 'About Us | Karma Industrial Safety Trainings',
      description: 'Established in 2017, Karma Industrial Safety Trainings provides premier safety training programs in Northwestern BC. Over 70 years of combined experience.',
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

import { type TeamMember } from '../../../types/database';

// Server component wrapper
export default async function AboutPage() {
  const teamMembersRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/team-members`, { cache: 'no-store' });
  if (!teamMembersRes.ok) {
    console.error('Failed to fetch team members:', await teamMembersRes.text());
    // Continue with empty array instead of throwing
    return <AboutPageClient teamMembers={[]} />;
  }
  const { teamMembers: rawTeamMembers } = await teamMembersRes.json();

  const teamMembers = rawTeamMembers.map((member: TeamMember) => ({
    ...member,
    specializations: Array.isArray(member.specializations) ? member.specializations : [],
  }));

  // JSON-LD structured data for about page
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://test-training-site-v2-xjey.vercel.app';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'Karma Industrial Safety Trainings',
    url: `${baseUrl}/`,
    description: 'Established in 2017, Karma Industrial Safety Trainings provides premier safety training programs geared to industry and commerce in Northwestern BC.',
    foundingDate: '2017',
    slogan: 'We believe the choices you make today will determine your tomorrow',
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
      availableLanguage: 'English',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Safety Training Services',
      itemListElement: [
        {
          '@type': 'Service',
          name: 'Industrial Safety Training',
          description: 'Comprehensive KIST programs based on WorkSafeBC regulations',
        },
        {
          '@type': 'Service',
          name: 'IVES Operator Certification',
          description: 'Heavy equipment operator training and certification programs',
        },
        {
          '@type': 'Service',
          name: 'Custom Course Design',
          description: 'Tailored training programs for specific safety needs',
        },
        {
          '@type': 'Service',
          name: 'Safety Consultation',
          description: 'Expert safety consulting for policy development and implementation',
        },
      ],
    },
    employee: [
      {
        '@type': 'Person',
        jobTitle: 'Safety Training Instructor',
        description: 'KIST, 3M, and IVES certified instructors with extensive industrial experience',
      },
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5.0',
      reviewCount: '100',
      bestRating: '5',
      worstRating: '1',
    },
    knowsAbout: [
      'WorkSafeBC Regulations',
      'Industrial Safety Training',
      'IVES Operator Certification',
      'Fall Protection',
      'WHMIS Training',
      'Safety Policy Development',
    ],
    areaServed: {
      '@type': 'Place',
      name: 'Northwestern British Columbia',
      address: {
        '@type': 'PostalAddress',
        addressRegion: 'BC',
        addressCountry: 'CA',
      },
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
      <AboutPageClient teamMembers={teamMembers} />
    </>
  );
}