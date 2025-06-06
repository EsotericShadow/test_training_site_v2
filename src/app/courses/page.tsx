
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, Users, Award, ArrowRight, Shield, Camera } from 'lucide-react';

interface Course {
  id: number;
  slug: string;
  title: string;
  duration: string;
  audience: string;
  description: string;
  features: { feature: string; display_order: number }[];
  category: { name: string };
  popular: boolean;
  image_alt: string;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/courses')
      .then((res) => res.json())
      .then((data) => {
        setCourses(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching courses:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
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
            <h1 className="text-5xl font-bold mb-6">Safety Training Courses</h1>
            <p className="text-xl text-gray-300 leading-relaxed mb-8">
              Comprehensive safety training programs designed for Northwestern BC industries. 
              All courses provide official certification and are based on WorkSafeBC regulations.
            </p>
            <div className="mb-8">
              <p className="text-brand-yellow font-medium text-lg italic">
                &quot;We believe the choices you make today will define your tomorrow&quot;
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-brand-yellow mb-2">14</div>
                <div className="text-gray-300">Safety Courses</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-brand-yellow mb-2">70+</div>
                <div className="text-gray-300">Years Experience</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-brand-yellow mb-2">2000+</div>
                <div className="text-gray-300">Students Trained</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Standards */}
      <section className="py-12 bg-brand-yellow/5 dark:bg-gray-800 border-b border-brand-yellow/20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div className="flex items-center justify-center space-x-3">
              <Shield className="h-8 w-8 text-brand-yellow" />
              <span className="font-semibold text-gray-900 dark:text-white">WorkSafeBC Compliant</span>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <Award className="h-8 w-8 text-brand-yellow" />
              <span className="font-semibold text-gray-900 dark:text-white">Official Certification</span>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <Users className="h-8 w-8 text-brand-yellow" />
              <span className="font-semibold text-gray-900 dark:text-white">Expert Instructors</span>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <Clock className="h-8 w-8 text-brand-yellow" />
              <span className="font-semibold text-gray-900 dark:text-white">Flexible Scheduling</span>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Complete Course Catalog
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Choose from our comprehensive selection of safety training courses, 
              each designed to meet industry standards and regulatory requirements.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <div key={course.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
                {course.popular && (
                  <div className="bg-brand-yellow text-black text-center py-2 text-sm font-semibold">
                    Popular Course
                  </div>
                )}
                <div className="bg-gray-200 dark:bg-gray-700 h-48 flex items-center justify-center">
                  <div className="text-center text-gray-500 dark:text-gray-400">
                    <Camera className="h-8 w-8 mx-auto mb-2 text-brand-yellow" />
                    <p className="font-medium text-sm">{course.title}</p>
                    <p className="text-xs">{course.image_alt}</p>
                  </div>
                </div>
                <div className="p-6">
                  <div className="mb-4">
                    <span className="bg-brand-yellow/10 text-brand-yellow px-3 py-1 rounded-full text-sm font-medium">
                      {course.category.name}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {course.title}
                  </h3>
                  <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4 text-brand-yellow" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4 text-brand-yellow" />
                      <span>{course.audience}</span>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                    {course.description}
                  </p>
                  <div className="space-y-2 mb-6">
                    {course.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                        <Award className="h-4 w-4 text-brand-yellow" />
                        <span>{feature.feature}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link 
                      href={`/courses/${course.slug}`}
                      className="flex-1 bg-brand-yellow hover:bg-brand-yellow-dark text-black px-4 py-3 rounded-lg font-semibold text-center transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg flex items-center justify-center space-x-2"
                    >
                      <span>Learn More</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link 
                      href={`/courses/${course.slug}#request-curriculum`}
                      className="flex-1 border-2 border-brand-yellow text-brand-yellow hover:bg-brand-yellow hover:text-black px-4 py-3 rounded-lg font-semibold text-center transition-all duration-200"
                    >
                      Get Curriculum
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 dark:bg-black text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Contact us today to schedule training for your team or to discuss custom course development.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/contact"
              className="bg-brand-yellow hover:bg-brand-yellow-dark text-black px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg"
            >
              Contact Us Today
            </Link>
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
