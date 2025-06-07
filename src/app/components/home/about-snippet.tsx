'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Camera } from 'lucide-react';

interface TeamMember {
  id: number;
  name: string;
  role: string;
  photo_url?: string;
}

interface CompanyInfo {
  id?: number;
  company_name: string;
  slogan: string;
  description: string;
  mission: string;
  total_experience: number;
  students_trained_count: number;
  established_year: number;
  total_courses: number;
}

interface WhyChooseUsItem {
  id?: number;
  point: string;
  display_order?: number;
}

export default function AboutSnippet() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [whyChooseUs, setWhyChooseUs] = useState<WhyChooseUsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch team members and company info in parallel
    Promise.all([
      fetch('/api/team-members').then(res => res.json()),
      fetch('/api/company-info').then(res => res.json())
    ])
    .then(([teamData, companyData]) => {
      setTeamMembers(Array.isArray(teamData) ? teamData : []);
      if (companyData.companyInfo) {
        setCompanyInfo(companyData.companyInfo);
      }
      if (companyData.whyChooseUs) {
        setWhyChooseUs(companyData.whyChooseUs);
      }
      setLoading(false);
    })
    .catch((error) => {
      console.error('Error fetching data:', error);
      setTeamMembers([]);
      setCompanyInfo(null);
      setWhyChooseUs([]);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="py-20 bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-yellow"></div>
      </div>
    );
  }

  return (
    <section className="py-20 bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              About {companyInfo?.company_name || 'Karma Training'}
            </h2>
            <div className="mb-6">
              <p className="text-brand-yellow font-medium text-lg italic">
                &quot;{companyInfo?.slogan || 'We believe the choices you make today will define your tomorrow'}&quot;
              </p>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              {companyInfo?.description || 'Karma Training was established in 2017 under the management of Jack Cook. Jack realized there was a need for safety training programs geared to industry and commerce in Northwestern BC.'}
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              {companyInfo?.mission || 'We understand that there are many adult learning styles and gear all our training to in-class coupled with practical components depending on the training program.'}
            </p>
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Meet Our Expert Team</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {teamMembers.map((member) => (
                  <div key={member.id} className="text-center">
                    <div className="h-24 w-24 mx-auto mb-2 rounded-lg overflow-hidden group hover:shadow-lg transition-all duration-300">
                      {member.photo_url ? (
                        <Image
                          src={member.photo_url}
                          alt={`${member.name} - ${member.role}`}
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="bg-gray-200 dark:bg-gray-700 h-full w-full flex items-center justify-center">
                          <div className="text-center text-gray-500 dark:text-gray-400">
                            <Camera className="h-6 w-6 mx-auto mb-1 text-brand-yellow" />
                            <p className="text-xs">Photo</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{member.name}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{member.role}</p>
                  </div>
                ))}
              </div>
            </div>
            <Link 
              href="/about"
              className="inline-flex items-center space-x-2 bg-brand-yellow hover:bg-brand-yellow-dark text-black px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg"
            >
              <span>Learn More About Us</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="relative">
            <div className="bg-gradient-to-br from-gray-900 to-black dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-6">Why Choose {companyInfo?.company_name || 'Karma Training'}?</h3>
              <ul className="space-y-4">
                {whyChooseUs.length > 0 ? (
                  whyChooseUs.map((item, index) => (
                    <li key={item.id || index} className="flex items-start space-x-3">
                      <div className="bg-brand-yellow rounded-full p-1 mt-1">
                        <div className="w-2 h-2 bg-black rounded-full"></div>
                      </div>
                      <span>{item.point}</span>
                    </li>
                  ))
                ) : (
                  // Fallback to hardcoded content if no database content
                  <>
                    <li className="flex items-start space-x-3">
                      <div className="bg-brand-yellow rounded-full p-1 mt-1">
                        <div className="w-2 h-2 bg-black rounded-full"></div>
                      </div>
                      <span>Expert instructors with {companyInfo?.total_experience || '70+'}+ years combined experience</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="bg-brand-yellow rounded-full p-1 mt-1">
                        <div className="w-2 h-2 bg-black rounded-full"></div>
                      </div>
                      <span>Comprehensive curriculum covering {companyInfo?.total_courses || '14'} safety topics</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="bg-brand-yellow rounded-full p-1 mt-1">
                        <div className="w-2 h-2 bg-black rounded-full"></div>
                      </div>
                      <span>Official KIST & IVES certification upon completion</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="bg-brand-yellow rounded-full p-1 mt-1">
                        <div className="w-2 h-2 bg-black rounded-full"></div>
                      </div>
                      <span>{companyInfo?.students_trained_count || '2000+'}+ students trained since {companyInfo?.established_year || '2017'}</span>
                    </li>
                  </>
                )}
              </ul>
              <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-700">
                <div className="text-center">
                  <div className="text-2xl font-bold text-brand-yellow">{companyInfo?.established_year || '2017'}</div>
                  <div className="text-xs text-gray-400">Established</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-brand-yellow">{companyInfo?.total_experience || '70+'}+</div>
                  <div className="text-xs text-gray-400">Years Experience</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-brand-yellow">{companyInfo?.students_trained_count || '2000+'}+</div>
                  <div className="text-xs text-gray-400">Students Trained</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

