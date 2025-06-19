// Optimized version of src/app/components/home/hero-section.tsx

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface HeroSection {
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

interface HeroFeature {
  title?: string;
  description?: string;
  display_order?: number;
}

interface HeroSectionProps {
  initialData?: {
    heroSection: HeroSection;
    heroStats: HeroStat[];
    heroFeatures: HeroFeature[];
  };
}

export default function HeroSection({ initialData }: HeroSectionProps) {
  const [heroData, setHeroData] = useState<{
    heroSection: HeroSection;
    heroStats: HeroStat[];
    heroFeatures: HeroFeature[];
  }>(initialData || {
    heroSection: {},
    heroStats: [],
    heroFeatures: []
  });
  const [loading, setLoading] = useState(!initialData);

  useEffect(() => {
    // Only fetch if no initial data provided
    if (!initialData) {
      fetch('/api/hero-section')
        .then((res) => res.json())
        .then((data) => {
          setHeroData({
            heroSection: data.heroSection || {},
            heroStats: data.heroStats || [],
            heroFeatures: data.heroFeatures || []
          });
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching hero section:', error);
          setLoading(false);
        });
    }
  }, [initialData]);

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center bg-gray-200 dark:bg-gray-800">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-yellow"></div>
      </div>
    );
  }

  const { heroSection, heroStats } = heroData;

  return (
    <section className="relative bg-gradient-to-br from-gray-900 to-black dark:from-black dark:to-gray-900 text-white py-20 overflow-hidden min-h-[600px]">
      {heroSection.background_image_url && (
        <div className="absolute inset-0 z-0">
          <Image
            src={heroSection.background_image_url}
            alt={heroSection.background_image_alt || 'Karma Training Hero Image'}
            fill
            className="object-cover opacity-90"
            priority
            sizes="100vw"
            quality={85}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
          />
          <div className="absolute inset-0 bg-black/50 z-10"></div>
        </div>
      )}
      <div className="container mx-auto px-4 relative z-20">
        <div className="max-w-4xl mx-auto text-center">
          {heroSection.slogan && (
            <p className="text-brand-yellow font-medium text-lg italic mb-4">
              {heroSection.slogan}
            </p>
          )}
          {(heroSection.main_heading || heroSection.highlight_text) && (
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              {heroSection.main_heading}{' '}
              {heroSection.highlight_text && (
                <span className="text-yellow-400">{heroSection.highlight_text}</span>
              )}
            </h1>
          )}
          {heroSection.subtitle && (
            <p className="text-xl text-gray-300 leading-relaxed mb-8 max-w-3xl mx-auto">
              {heroSection.subtitle}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            {heroSection.primary_button_text && heroSection.primary_button_link && (
              <Link
                href={heroSection.primary_button_link}
                className="inline-flex items-center justify-center space-x-2 bg-amber-400 hover:bg-amber-500 text-black px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg"
              >
                {heroSection.primary_button_text}
              </Link>
            )}
            {heroSection.secondary_button_text && heroSection.secondary_button_link && (
              <Link
                href={heroSection.secondary_button_link}
                className="inline-flex items-center justify-center space-x-2 bg-transparent border-2 border-amber-400 hover:bg-amber-400 hover:text-black text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg"
              >
                {heroSection.secondary_button_text}
              </Link>
            )}
          </div>
          {heroStats.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              {heroStats
                .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
                .map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl font-bold text-yellow-500 mb-2">{stat.number_text}</div>
                    <div className="text-gray-300">{stat.label}</div>
                    {stat.description && (
                      <div className="text-sm text-gray-400 mt-1">{stat.description}</div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

