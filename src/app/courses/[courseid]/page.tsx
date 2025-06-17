'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Clock, Users, Award, CheckCircle, Camera, Phone, Mail, Shield, MapPin, BookOpen } from 'lucide-react';

interface Course {
  id: number;
  slug: string;
  title: string;
  duration: string;
  audience: string;
  description: string;
  overview?: string;
  includes?: string;
  format?: string;
  passing_grade?: string;
  image_url?: string;
  image_alt?: string;
  features: { feature: string; display_order: number }[];
  category: { name: string };
  popular: boolean;
}

interface PageProps {
  params: Promise<{
    courseid: string;
  }>;
}

export default function CoursePage({ params }: PageProps) {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courseSlug, setCourseSlug] = useState<string>('');

  useEffect(() => {
    const getCourseSlug = async () => {
      const resolvedParams = await params;
      setCourseSlug(resolvedParams.courseid);
    };
    getCourseSlug();
  }, [params]);

  useEffect(() => {
    if (!courseSlug) return;

    const fetchCourse = async () => {
      try {
        const response = await fetch(`/api/courses/${courseSlug}`);
        
        if (response.ok) {
          const data = await response.json();
          setCourse(data.course);
        } else if (response.status === 404) {
          setError('Course not found');
        } else {
          setError('Failed to load course');
        }
      } catch (error) {
        console.error('Error fetching course:', error);
        setError('Failed to load course');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseSlug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading course information...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {error || 'Course Not Found'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            This course may not be available or the link may be incorrect.
          </p>
          <Link href="/courses" className="text-yellow-500 hover:text-yellow-600 font-semibold">
            ← View All Available Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      
      {/* Navigation */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 py-6">
        <div className="container mx-auto px-4">
          <Link 
            href="/courses"
            className="inline-flex items-center space-x-2 text-yellow-500 hover:text-yellow-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to All Courses</span>
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-black text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto text-center">
            <div className="mb-6">
              <span className="bg-yellow-500/20 text-yellow-500 px-4 py-2 rounded-full text-sm font-medium">
                {course.category.name}
              </span>
              {course.popular && (
                <span className="ml-3 bg-yellow-500 text-black px-4 py-2 rounded-full text-sm font-medium">
                  Popular Course
                </span>
              )}
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">{course.title}</h1>
            
            <p className="text-xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
              {course.description}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="#request-syllabus"
                className="bg-yellow-500 hover:bg-yellow-600 text-black px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg"
              >
                Request Course Syllabus
              </a>
              <a 
                href="tel:250-615-3727"
                className="border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200"
              >
                Call: 250-615-3727
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Course Image */}
      <section className="py-12 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="relative bg-gray-200 dark:bg-gray-700 rounded-2xl h-64 md:h-80 overflow-hidden">
              {course.image_url ? (
                <Image 
                  src={course.image_url} 
                  alt={course.image_alt || course.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                  priority
                />
              ) : (
                <div className="h-full flex items-center justify-center text-center text-gray-600 dark:text-gray-300">
                  <div>
                    <Camera className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
                    <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      {course.image_alt || 'Professional safety training course'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Course Details */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* Course Overview */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Course Overview</h2>
                  <div className="prose prose-lg dark:prose-invert max-w-none">
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {course.overview || course.description}
                    </p>
                  </div>
                </div>

                {/* What's Included */}
                {course.includes && (
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">What&apos;s Included</h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {course.includes}
                    </p>
                  </div>
                )}

                {/* Learning Objectives */}
                {course.features && course.features.length > 0 && (
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Learning Objectives</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {course.features
                        .sort((a, b) => a.display_order - b.display_order)
                        .map((objective, index) => (
                        <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <CheckCircle className="h-6 w-6 text-yellow-500 mt-1 flex-shrink-0" />
                          <span className="text-gray-700 dark:text-gray-300">{objective.feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Certification */}
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
                  <div className="flex items-start space-x-4">
                    <Award className="h-8 w-8 text-yellow-600 dark:text-yellow-400 mt-1" />
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Official Certification</h3>
                      <p className="text-gray-700 dark:text-gray-300 mb-3">
                        Upon successful completion, you will receive official certification recognized by WorkSafeBC and industry employers throughout British Columbia.
                      </p>
                      {course.passing_grade && (
                        <p className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">
                          Passing Grade: {course.passing_grade}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                
                {/* Course Details Card */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Course Details</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5 text-yellow-500" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Duration</p>
                        <p className="font-medium text-gray-900 dark:text-white">{course.duration}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Users className="h-5 w-5 text-yellow-500" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Target Audience</p>
                        <p className="font-medium text-gray-900 dark:text-white">{course.audience}</p>
                      </div>
                    </div>
                    {course.format && (
                      <div className="flex items-center space-x-3">
                        <BookOpen className="h-5 w-5 text-yellow-500" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Format</p>
                          <p className="font-medium text-gray-900 dark:text-white">{course.format}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center space-x-3">
                      <Shield className="h-5 w-5 text-yellow-500" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Compliance</p>
                        <p className="font-medium text-gray-900 dark:text-white">WorkSafeBC Approved</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Card */}
                <div className="bg-gray-900 dark:bg-gray-800 text-white rounded-xl p-6">
                  <h3 className="text-xl font-semibold mb-4">Ready to Register?</h3>
                  <p className="text-gray-300 mb-6">Contact us to schedule this course for your team or join an upcoming session.</p>
                  
                  <div className="space-y-4">
                    <a 
                      href="tel:250-615-3727"
                      className="flex items-center space-x-3 text-yellow-400 hover:text-yellow-300 transition-colors"
                    >
                      <Phone className="h-5 w-5" />
                      <span className="font-medium">250-615-3727</span>
                    </a>
                    <a 
                      href="mailto:info@karmatraining.ca"
                      className="flex items-center space-x-3 text-yellow-400 hover:text-yellow-300 transition-colors"
                    >
                      <Mail className="h-5 w-5" />
                      <span className="font-medium">info@karmatraining.ca</span>
                    </a>
                    <div className="flex items-start space-x-3 text-gray-300">
                      <MapPin className="h-5 w-5 mt-1" />
                      <div>
                        <p className="font-medium">Serving Northwestern BC</p>
                        <p className="text-sm">On-site training available</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-gray-700">
                    <Link 
                      href="/contact"
                      className="w-full bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-3 rounded-lg font-semibold text-center transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg block"
                    >
                      Request More Information
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Request Syllabus Section */}
      <section id="request-syllabus" className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Request Course Syllabus</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              Get detailed information about this course including learning objectives, schedule, and certification requirements.
            </p>
            
            <div className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Phone</h4>
                  <a href="tel:250-615-3727" className="text-yellow-600 hover:text-yellow-700 font-medium">
                    250-615-3727
                  </a>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Email</h4>
                  <a href="mailto:info@karmatraining.ca" className="text-yellow-600 hover:text-yellow-700 font-medium">
                    info@karmatraining.ca
                  </a>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Service Area</h4>
                  <p className="text-gray-600 dark:text-gray-400">Northwestern British Columbia</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Training Options</h4>
                  <p className="text-gray-600 dark:text-gray-400">On-site and facility-based training available</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

