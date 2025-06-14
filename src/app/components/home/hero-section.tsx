'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface HeroSection {
  slogan?: string;
  main_heading?: string;
  highlight_text?: string;
  subtitle?: string;
  background_image_url?: string;  // ✅ Fixed: Changed to match database
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

export default function HeroSection() {
  const [heroData, setHeroData] = useState<{
    heroSection: HeroSection;
    heroStats: HeroStat[];
    heroFeatures: HeroFeature[];
  }>({
    heroSection: {},
    heroStats: [],
    heroFeatures: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, []);

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center bg-gray-200 dark:bg-gray-800">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-yellow"></div>
      </div>
    );
  }

  const { heroSection, heroStats } = heroData;

  return (
    <section className="relative bg-gradient-to-br from-gray-900 to-black dark:from-black dark:to-gray-900 text-white py-20">
      {heroSection.background_image_url && (  // ✅ Fixed: Changed to match database
        <div className="absolute inset-0">
          <Image
            src={heroSection.background_image_url}  // ✅ Fixed: Changed to match database
            alt={heroSection.background_image_alt || 'Hero background'}
            fill
            className="object-cover opacity-30"
            priority
          />
        </div>
      )}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {heroSection.slogan && (
            <p className="text-brand-yellow font-medium text-lg italic mb-4">
              {heroSection.slogan}
            </p>
          )}
          {(heroSection.main_heading || heroSection.highlight_text) && (
            <h1 className="text-5xl font-bold mb-6">
              {heroSection.main_heading}{' '}
              {heroSection.highlight_text && (
                <span className="text-yellow-400">{heroSection.highlight_text}</span>
              )}
            </h1>
          )}
          {heroSection.subtitle && (
            <p className="text-xl text-white-300 leading-relaxed mb-8">
              {heroSection.subtitle}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {heroSection.primary_button_text && heroSection.primary_button_link && (
              <Link
                href={heroSection.primary_button_link}
                className="bg-yellow-400 hover:bg-yellow-500 text-black px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200"
              >
                {heroSection.primary_button_text}
              </Link>
            )}
            {heroSection.secondary_button_text && heroSection.secondary_button_link && (
              <Link
                href={heroSection.secondary_button_link}
                className="border-2 border-gray-300 hover:bg-gray-300 hover:text-gray-900 text-gray-300 px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200"
              >
                {heroSection.secondary_button_text}
              </Link>
            )}
          </div>
          {heroStats.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto mt-12">
              {heroStats
                .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
                .map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl font-bold text-yellow-500 mb-2">{stat.number_text}</div>
                    <div className="text-white-400">{stat.label}</div>
                    {stat.description && (
                      <div className="text-sm text-white-500 mt-1">{stat.description}</div>
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

