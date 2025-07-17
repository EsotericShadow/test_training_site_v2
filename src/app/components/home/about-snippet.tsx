'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, CheckCircle } from 'lucide-react';
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
    fetch('/api/adm_f7f8556683f1cdc65391d8d2_8e91/company-info').then(res => res.json())
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
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-1" />
                  <span className="text-lg text-gray-700 dark:text-gray-300">{item.point}</span>
                </li>
              ))}
            </ul>
            <Link href="/about" className="animate-in inline-flex items-center text-yellow-500 hover:text-yellow-600 font-semibold text-lg">
              Learn More About Us <ArrowRight className="h-5 w-5 ml-2" />
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

