'use client';

import Link from 'next/link';
import { useGsap } from '@/app/hooks/useGsap';
import { gsap } from 'gsap';

interface HeroSectionData {
  slogan?: string;
  main_heading?: string;
  highlight_text?: string;
  subtitle?: string;
  background_image_url?: string;
  background_image_alt?: string;
  primary_button_text?: string;
  primary_button_link?: string;
  secondary_button_text?: string;
  secondary_button_link?: string;
}

interface HeroStat {
  number_text?: string;
  label?: string;
  description?: string;
  display_order?: number;
}

interface HeroSectionProps {
  initialData?: {
    heroSection: HeroSectionData;
    heroStats: HeroStat[];
  };
}

export default function HeroSection({ initialData }: HeroSectionProps) {
  const sectionRef = useGsap((ref) => {
    if (!ref.current) return;

    gsap.to(ref.current.querySelectorAll('.slogan, .main-heading, .subtitle, .cta-button'), {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: 'power3.out',
      stagger: 0.15,
    });
  });

  if (!initialData) {
    return <div className="h-screen bg-gray-900 flex items-center justify-center"><div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-yellow-400"></div></div>;  // Restore loading if needed
  }

  const { heroSection, heroStats } = initialData;

  return (
    <section ref={sectionRef} className="relative text-white">
      <div className="relative container mx-auto px-4 py-48 text-center">
        <p className="slogan text-yellow-400 font-semibold text-lg mb-4 opacity-0 translate-y-[50px]">{heroSection?.slogan}</p>
        <h1 className="main-heading text-4xl md:text-6xl font-extrabold leading-tight mb-6 opacity-0 translate-y-[50px]">
          {heroSection?.main_heading} <span className="text-yellow-400">{heroSection?.highlight_text}</span>
        </h1>
        <p className="subtitle text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-10 opacity-0 translate-y-[50px]">
          {heroSection?.subtitle}
        </p>
        <div className="flex justify-center gap-4">
          <Link href={heroSection?.primary_button_link || '/courses'} className="cta-button bg-yellow-500 hover:bg-yellow-600 text-gray-900 dark:text-white font-bold py-4 px-8 rounded-lg transition duration-300 transform hover:scale-105 shadow-lg opacity-0 translate-y-[50px]">
            {heroSection?.primary_button_text || 'View Courses'}
          </Link>
          <Link href={heroSection?.secondary_button_link || '/contact'} className="cta-button bg-transparent border-2 border-yellow-500 text-yellow-500 font-bold py-4 px-8 rounded-lg hover:bg-yellow-400 hover:text-gray-900 dark:hover:text-white transition duration-300 transform hover:scale-105 opacity-0 translate-y-[50px]">
            {heroSection?.secondary_button_text || 'Contact Us'}
          </Link>
        </div>
      </div>

      {heroStats && heroStats.length > 0 && (
        <div className="relative bg-gray-800 bg-opacity-50">
          <div className="container mx-auto px-4 py-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              {heroStats.sort((a, b) => (a.display_order || 0) - (b.display_order || 0)).map((stat, index) => (
                <div key={index}>
                  <p className="text-4xl font-bold text-yellow-400">{stat.number_text}</p>
                  <p className="text-lg font-semibold mt-2">{stat.label}</p>
                  <p className="text-gray-400">{stat.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}