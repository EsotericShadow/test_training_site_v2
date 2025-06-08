'use client';

import { useState, useEffect } from 'react';
import { Shield, Users, Award, CheckCircle, LucideIcon } from 'lucide-react';

interface TeamMember {
  id: number;
  name: string;
  role: string;
  bio: string;
  photo_url?: string;
  specializations: string; // JSON string in database
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

interface CompanyValue {
  id?: number;
  title: string;
  description: string;
  icon: string;
  display_order?: number;
}

interface WhyChooseUsItem {
  id?: number;
  point: string;
  display_order?: number;
}

export default function AboutPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [companyValues, setCompanyValues] = useState<CompanyValue[]>([]);
  const [whyChooseUs, setWhyChooseUs] = useState<WhyChooseUsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all data in parallel
    Promise.all([
      fetch('/api/team-members').then(res => res.json()),
      fetch('/api/company-info').then(res => res.json())
    ])
    .then(([teamData, companyData]) => {
      setTeamMembers(Array.isArray(teamData) ? teamData : []);
      
      if (companyData.companyInfo) {
        setCompanyInfo(companyData.companyInfo);
      }
      if (companyData.companyValues) {
        setCompanyValues(companyData.companyValues);
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
      setCompanyValues([]);
      setWhyChooseUs([]);
      setLoading(false);
    });
  }, []);

  // Icon mapping for company values
  const getIcon = (iconName: string) => {
    const iconMap: { [key: string]: LucideIcon } = {
      shield: Shield,
      users: Users,
      award: Award,
      target: CheckCircle,
      leaf: Shield
    };
    const IconComponent = iconMap[iconName.toLowerCase()] || Shield;
    return <IconComponent className="h-8 w-8 text-brand-yellow" />;
  };

  // Fallback data
  const fallbackCompanyInfo = {
    company_name: 'Karma Training',
    slogan: 'We believe the choices you make today will determine your tomorrow',
    description: 'Established in 2017, we provide premier safety training programs geared to industry and commerce in Northwestern BC. Our experienced team brings over 70 years of combined industrial and educational experience.',
    mission: 'Karma Training elected not to have a campus but rather provide training using your company&apos;s facilities on the equipment your staff use in the normal day-to-day operation.',
    total_experience: 70,
    students_trained_count: 2000,
    established_year: 2017,
    total_courses: 14
  };

  const fallbackValues = [
    {
      id: 1,
      title: 'Industrial Safety Training',
      description: 'Comprehensive KIST programs based on WorkSafeBC regulations',
      icon: 'shield'
    },
    {
      id: 2,
      title: 'IVES Operator Certification',
      description: 'Heavy equipment operator training and certification programs',
      icon: 'award'
    },
    {
      id: 3,
      title: 'Custom Course Design',
      description: 'Tailored training programs for your specific safety needs',
      icon: 'target'
    },
    {
      id: 4,
      title: 'Consultation',
      description: 'Expert safety consulting for policy development and implementation',
      icon: 'users'
    },
    {
      id: 5,
      title: 'Policy & Procedure Writing',
      description: 'Development of comprehensive safety policies and procedures',
      icon: 'shield'
    }
  ];

  // Use CMS data or fallback
  const displayCompanyInfo = companyInfo || fallbackCompanyInfo;
  const displayValues = companyValues.length > 0 ? companyValues : fallbackValues;

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center transition-colors duration-300">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-yellow"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 to-black dark:from-black dark:to-gray-900 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">About {displayCompanyInfo.company_name}</h1>
            <p className="text-xl text-gray-300 leading-relaxed mb-8">
              {displayCompanyInfo.description}
            </p>
            <div className="mb-8">
              <p className="text-brand-yellow font-medium text-lg italic">
                &quot;{displayCompanyInfo.slogan}&quot;
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-brand-yellow mb-2">{displayCompanyInfo.established_year}</div>
                <div className="text-gray-300">Established</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-brand-yellow mb-2">{displayCompanyInfo.total_experience}+</div>
                <div className="text-gray-300">Years Experience</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-brand-yellow mb-2">{displayCompanyInfo.students_trained_count}+</div>
                <div className="text-gray-300">Students Trained</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Company Story */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">Our Story</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                {displayCompanyInfo.description}
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                {displayCompanyInfo.mission}
              </p>
              <div className="bg-brand-yellow/10 border-l-4 border-brand-yellow p-6 rounded-r-lg">
                <p className="text-lg font-semibold text-gray-900 dark:text-white italic">
                  &quot;{displayCompanyInfo.slogan}&quot;
                </p>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  This is especially true with the decisions you make regarding safety. Wrong decisions 
                  can be costly and can change your employee&apos;s and company&apos;s future.
                </p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center space-x-3 mb-4">
                  <Users className="h-8 w-8 text-brand-yellow" />
                  <h3 className="text-xl font-medium text-gray-900 dark:text-white">Our Approach</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  We understand that there are many adult learning styles and gear all our training 
                  to in-class coupled with practical components depending on the training program.
                </p>
              </div>
              
              {/* Why Choose Us Section */}
              {whyChooseUs.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-4">Why Choose {displayCompanyInfo.company_name}?</h3>
                  <ul className="space-y-2">
                    {whyChooseUs.map((item, index) => (
                      <li key={item.id || index} className="flex items-start space-x-2">
                        <CheckCircle className="h-5 w-5 text-brand-yellow mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-400">{item.point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Meet Our Specialists</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Our instructors are experienced in the education, industrial, and construction sectors. 
              They are KIST, 3M, and IVES certified instructors with over {displayCompanyInfo.total_experience} years of combined experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {teamMembers.map((member) => (
              <div key={member.id} className="bg-white dark:bg-gray-900 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
                <div className="p-8">
                  <div className="flex items-start space-x-4 mb-6">
                    <div className="bg-brand-yellow/20 rounded-full p-3">
                      <Users className="h-8 w-8 text-brand-yellow" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{member.name}</h3>
                      <p className="text-gray-600 dark:text-gray-400">{member.role}</p>
                    </div>
                  </div>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 leading-normal">
                    {member.bio}
                  </p>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Specialties:</h4>
                    <div className="flex flex-wrap gap-2">
                      {JSON.parse(member.specializations || '[]').map((specialty: string, idx: number) => (
                        <span 
                          key={idx}
                          className="bg-brand-yellow/20 text-brand-yellow px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section - Using Company Values */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Our Services</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-none mx-auto">
              We provide comprehensive safety training and certification services for Northwestern BC industries.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayValues.map((value, index) => (
              <div key={value.id || index} className="text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="bg-brand-yellow/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  {getIcon(value.icon)}
                </div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">{value.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-black dark:from-black dark:to-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Contact us today to schedule training for your team or to discuss custom course development.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/contact"
              className="bg-brand-yellow hover:bg-brand-yellow-dark text-black px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg"
            >
              Contact Us Today
            </a>
            <a 
              href="tel:250-615-3727"
              className="border-2 border-white hover:bg-white hover:text-gray-900 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200"
            >
              Call (250) 615-3727
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

