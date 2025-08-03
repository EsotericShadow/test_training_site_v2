/*
 * Karma Industrial Safety Training Website
 * Written and developed by Gabriel Lacroix for Evergreen Web Solutions
 *
 * File: src/app/components/home/about-snippet.tsx
 * Description: Static about snippet component for homepage with company overview information.
 * Dependencies: React 19, Next.js 15
 * Created: 2025-06-06
 * Last Modified: 2025-08-03
 * Version: 1.0.11
 */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import HomeIcon from './HomeIcons';
import { useGsap } from '@/app/hooks/useGsap';
import { gsap } from 'gsap';

interface TeamMember {
  id: number;
  name: string;
  role: string;
  photo_url?: string;
}

interface CompanyInfo {
  company_name: string;
  slogan: string;
  description: string;
  mission: string;
}

interface WhyChooseUsItem {
  id?: number;
  point: string;
}

interface AboutSnippetProps {
  teamMembers: TeamMember[];
}

export default function AboutSnippet({ teamMembers }: AboutSnippetProps) {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [whyChooseUs, setWhyChooseUs] = useState<WhyChooseUsItem[]>([]);
  const [loading, setLoading] = useState(true);

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
    fetch('/api/public-company-info').then(res => res.json())
    .then((companyData) => {
      setCompanyInfo(companyData.companyInfo);
      setWhyChooseUs(companyData.whyChooseUs || []);
      setLoading(false);
    })
    .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <section className="py-20 bg-gray-50 dark:bg-gray-900"></section>;
  }

  return (
    <section ref={sectionRef} className="py-20 bg-white dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="animate-in text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Your Partner in Workplace Safety
            </h2>
            <p className="animate-in text-xl text-gray-600 dark:text-gray-400 mb-6">
              {companyInfo?.description}
            </p>
            <ul className="animate-in space-y-4 mb-8">
              {whyChooseUs.map(item => (
                <li key={item.id} className="flex items-start">
                  <HomeIcon name="check-circle" className="h-6 w-6 text-green-500 mr-3 mt-1" />
                  <span className="text-lg text-gray-700 dark:text-gray-300">{item.point}</span>
                </li>
              ))}
            </ul>
            <Link href="/about" className="animate-in inline-flex items-center text-yellow-500 hover:text-yellow-600 font-semibold text-lg">
              Learn More About Us <HomeIcon name="arrow-right" className="h-5 w-5 ml-2" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {teamMembers.map((member, index) => (
              <div key={member.id} className={`animate-in rounded-lg overflow-hidden transform transition-transform duration-300 hover:scale-105 group ${index % 2 === 0 ? 'translate-y-4' : '-translate-y-4'}`}>
                {member.photo_url && (
                  <div className="relative h-64">
                    <Image
                      src={member.photo_url}
                      alt={member.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-4">
                      <h3 className="text-white text-lg font-bold">{member.name}</h3>
                      <p className="text-yellow-400 text-sm">{member.role}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
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