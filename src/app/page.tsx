import { Metadata } from 'next';
import Image from 'next/image';
import DynamicFeaturedCourses from '@/app/components/home/DynamicFeaturedCourses';
import DynamicAboutSnippet from '@/app/components/home/DynamicAboutSnippet';
import { Suspense } from 'react';
import dynamicComponent from 'next/dynamic';

const DynamicHeroSection = dynamicComponent(() => import('@/app/components/home/hero-section'));

export const dynamic = 'force-dynamic';

// Fetch hero data server-side for better performance
async function getHeroData() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/hero-section`, { cache: 'no-store' });
    
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

// Generate metadata for SEO (replaces NextSeo)
export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  
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
    metadataBase: new URL(baseUrl as string),
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
    other: heroData.heroSection.background_image_url
      ? { preload: `<${heroData.heroSection.background_image_url}>; rel=preload; as=image` }
      : {},
  };
}

// Server component (no 'use client' directive)
export default async function Home() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  
  // Fetch hero data server-side
  const heroData = await getHeroData();
  const teamMembersRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/team-members`, { cache: 'no-store' });
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