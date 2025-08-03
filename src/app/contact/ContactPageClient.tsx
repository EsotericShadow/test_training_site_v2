/*
 * Karma Industrial Safety Training Website
 * Written and developed by Gabriel Lacroix for Evergreen Web Solutions
 *
 * File: ContactPageClient.tsx
 * Description: Client-side Contact page component with interactive contact form and information display.
 * Dependencies: React 19, Next.js 15, SecureContactForm component
 * Created: June 3, 2025
 * Last Modified: August 3, 2025
 * Version: 1.0.0
 */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ContactIcon from './ContactIcons';
import SecureContactForm from '@/app/components/forms/SecureContactForm';
import { useGsap } from '@/app/hooks/useGsap';
import { gsap } from 'gsap';

interface CompanyInfo {
  phone?: string;
  email?: string;
  location?: string;
  business_hours?: string;
}

export default function ContactPageClient() {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [heroImageAlt, setHeroImageAlt] = useState<string | null>(null);

  const sectionRef = useGsap((ref) => {
    if (!ref.current) return;
    gsap.from(ref.current.querySelectorAll('.animate-in'), {
      opacity: 0,
      y: 50,
      duration: 1,
      ease: 'power3.out',
      stagger: 0.2,
      scrollTrigger: {
        trigger: ref.current,
        start: 'top 80%',
      },
    });
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [companyInfoResponse, heroImageResponse] = await Promise.all([
          fetch('/api/adm_f7f8556683f1cdc65391d8d2_8e91/company-info'),
          fetch('/api/adm_f7f8556683f1cdc65391d8d2_8e91/files?category=other')
        ]);

        if (companyInfoResponse.ok) {
          const companyData = await companyInfoResponse.json();
          setCompanyInfo(companyData.companyInfo);
        } else {
          console.error('Failed to load company info');
        }

        if (heroImageResponse.ok) {
          const { file } = await heroImageResponse.json();
          setHeroImage(file.blob_url);
          setHeroImageAlt(file.alt_text || 'Contact page hero image');
        } else {
          console.error('Failed to load hero image');
          setHeroImage('https://bluvpssu00ym8qv7.public.blob.vercel-storage.com/other/1750011620811-IMG_8439.JPG'); // Fallback
          setHeroImageAlt('Safety training in action');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const contactDetails = [
    { icon: 'phone', title: 'Phone', value: companyInfo?.phone || '250-615-3727', href: `tel:${companyInfo?.phone || '250-615-3727'}` },
    { icon: 'mail', title: 'Email', value: companyInfo?.email || 'info@karmatraining.ca', href: `mailto:${companyInfo?.email || 'info@karmatraining.ca'}` },
    { icon: 'map-pin', title: 'Service Area', value: companyInfo?.location || 'Northwestern BC' },
    { icon: 'clock', title: 'Business Hours', value: companyInfo?.business_hours || 'Mon-Fri, 8am - 5pm' },
  ];

  return (
    <div ref={sectionRef} className="min-h-screen pt-13">
      <section className="relative py-24 text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          {heroImage && (
            <Image
              src={heroImage}
              alt={heroImageAlt || 'Hero background'}
              fill
              className="object-cover opacity-30"
              priority
              sizes="100vw"
            />
          )}
        </div>
        <div className="relative container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-4">Get in Touch</h1>
          <p className="text-xl md:text-2xl text-yellow-400">We&apos;re here to help you build a safer workplace.</p>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-1">
              <h2 className="animate-in text-3xl font-bold text-gray-200 mb-6">Contact Information</h2>
              <div className="space-y-6">
                {contactDetails.map(detail => (
                  <div key={detail.title} className="animate-in flex items-start space-x-4">
                    <div className="bg-yellow-400 text-gray-200 rounded-full p-3">
                      <ContactIcon name={detail.icon as string} className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-300">{detail.title}</h3>
                      {detail.href ? (
                        <a href={detail.href} className="text-lg text-gray-200 hover:text-yellow-500">{detail.value}</a>
                      ) : (
                        <p className="text-lg text-gray-300">{detail.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-2 rounded-lg shadow-lg animate-in bg-gradient-to-br from-white/30 via-white/10 to-transparent p-[1px]">
              <div className="h-full w-full rounded-[7px] text-gray-300 bg-gray-900/50 p-8 backdrop-blur-lg backdrop-brightness-110 backdrop-saturate-150">
                <SecureContactForm onSuccess={() => {}} onError={() => {}} className="max-w-lg mx-auto" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Training?</h2>
          <p className="text-xl mb-8">Browse our full course catalog and find the right training for your team.</p>
          <Link href="/courses" className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-4 px-8 rounded-lg transition duration-300 transform hover:scale-105 shadow-lg">
            View All Courses
          </Link>
        </div>
      </section>
    </div>
  );
}//   ___________       *Written and developed by Gabriel Lacroix*               __      ___.
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