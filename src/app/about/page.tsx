'use client';

import { useState, useEffect } from 'react';
import { Shield, Users, Award, CheckCircle } from 'lucide-react';

interface TeamMember {
  id: number;
  name: string;
  role: string;
  bio: string;
  photo_url?: string;
  specializations: string; // JSON string in database
}

export default function AboutPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/team-members')
      .then((res) => res.json())
      .then((data) => {
        setTeamMembers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching team members:', error);
        setTeamMembers([]);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-yellow"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 to-blue-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">About Karma Training</h1>
            <p className="text-xl text-blue-100 leading-relaxed">
              Established in 2017, we provide premier safety training programs geared to industry 
              and commerce in Northwestern BC. Our experienced team brings over 70 years of combined 
              industrial and educational experience.
            </p>
          </div>
        </div>
      </section>

      {/* Company Story */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Karma Training was established in 2017 under the management of Jack Cook. Jack realized 
                there was a need for safety training programs geared to industry and commerce in Northwestern BC.
              </p>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Karma Training elected not to have a campus but rather provide training using your 
                company&apos;s facilities on the equipment your staff use in the normal day-to-day operation.
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-lg">
                <p className="text-lg font-semibold text-blue-900 italic">
                  &quot;We believe the choices you make today will determine your tomorrow&quot;
                </p>
                <p className="text-gray-600 mt-2">
                  This is especially true with the decisions you make regarding safety. Wrong decisions 
                  can be costly and can change your employee&apos;s and company&apos;s future.
                </p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-xl">
                <div className="flex items-center space-x-3 mb-4">
                  <Users className="h-8 w-8 text-green-600" />
                  <h3 className="text-xl font-medium text-gray-900">Our Approach</h3>
                </div>
                <p className="text-gray-600">
                  We understand that there are many adult learning styles and gear all our training 
                  to in-class coupled with practical components depending on the training program.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Meet Our Specialists</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our instructors are experienced in the education, industrial, and construction sectors. 
              They are KIST, 3M, and IVES certified instructors with over 70 years of combined experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {teamMembers.map((member) => (
              <div key={member.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-8">
                  <div className="flex items-start space-x-4 mb-6">
                    <div className="bg-blue-100 rounded-full p-3">
                      <Users className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{member.name}</h3>
                      <p className="text-gray-600">{member.role}</p>
                    </div>
                  </div>
                  <p className="text-lg text-gray-600 mb-6 leading-normal">
                    {member.bio}
                  </p>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Specialties:</h4>
                    <div className="flex flex-wrap gap-2">
                      {JSON.parse(member.specializations || '[]').map((specialty: string, idx: number) => (
                        <span 
                          key={idx}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
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

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Services</h2>
            <p className="text-xl text-gray-600 max-w-none mx-auto">
              We provide comprehensive safety training and certification services for Northwestern BC industries.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-3">Industrial Safety Training</h3>
              <p className="text-gray-600">Comprehensive KIST programs based on WorkSafeBC regulations</p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Award className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-3">IVES Operator Certification</h3>
              <p className="text-gray-600">Heavy equipment operator training and certification programs</p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-3">Custom Course Design</h3>
              <p className="text-gray-600">Tailored training programs for your specific safety needs</p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-orange-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-3">Consultation</h3>
              <p className="text-gray-600">Expert safety consulting for policy development and implementation</p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-indigo-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-3">Policy & Procedure Writing</h3>
              <p className="text-gray-600">Development of comprehensive safety policies and procedures</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}