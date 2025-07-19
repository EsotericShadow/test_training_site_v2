'use client';

import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import remarkGfm from 'remark-gfm';

const ReactMarkdown = dynamic(() => import('react-markdown'), { ssr: false });
import { Clock, Users, Award, CheckCircle, ArrowLeft, BookOpen, Shield, Phone, Mail } from 'lucide-react';

interface Course {
  id: number;
  slug: string;
  title: string;
  duration: string;
  audience: string;
  description: string;
  what_youll_learn: string;
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

interface CoursePageClientProps {
  course: Course;
}

export default function CoursePageClient({ course }: CoursePageClientProps) {
  return (
    <div className="min-h-screen transition-colors duration-300">
      
      <div className="border-b border-gray-200 dark:border-gray-700 py-4">
        <div className="container mx-auto px-4">
          <Link 
            href="/courses"
            className="inline-flex items-center space-x-2 text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 transition-colors font-medium"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to All Courses</span>
          </Link>
        </div>
      </div>

      <section className="relative py-12 sm:py-20 text-white overflow-hidden">
        <div className="absolute inset-0 z-0 h-64 md:h-96">
          {course.image_url ? (
            <Image
              src={course.image_url}
              alt={course.image_alt || course.title}
              fill
              className="object-cover opacity-20"
              priority
              sizes="100vw"
              quality={80}
            />
          ) : (
            <div className="bg-gray-800 w-full h-full" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl">
            <span className="bg-yellow-500 text-gray-900 dark:text-white px-4 py-2 rounded-full text-sm font-semibold">
              {course.category.name}
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold my-6 text-white drop-shadow-lg">{course.title}</h1>
            <div className="text-xl text-gray-200 max-w-3xl leading-relaxed">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {course.overview || course.description}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 pt-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 rounded-2xl shadow-2xl p-8">
            <div className="space-y-12">
              <div>
                <h2 className="animate-in text-3xl font-bold text-gray-900 dark:text-white mt-12 mb-6">What You&apos;ll Learn</h2>
                <div className="prose prose-lg dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {course.what_youll_learn}
                  </ReactMarkdown>
                </div>
              </div>

              {course.features && course.features.length > 0 && (
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 border-l-4 border-yellow-500 pl-4">Learning Objectives</h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {course.features
                      .sort((a, b) => a.display_order - b.display_order)
                      .map((objective, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300 text-lg">{objective.feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {course.includes && (
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 border-l-4 border-yellow-500 pl-4">What&apos;s Included</h3>
                  <div className="prose prose-lg dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {course.includes}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:sticky top-24 self-start">
            <div className="text-white rounded-2xl shadow-2xl p-8 space-y-6">
              <h3 className="text-2xl font-bold text-yellow-400">Course Details</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Clock className="h-6 w-6 text-yellow-400" />
                  <div>
                    <p className="text-sm text-gray-300">Duration</p>
                    <p className="font-semibold text-lg">{course.duration}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Users className="h-6 w-6 text-yellow-400" />
                  <div>
                    <p className="text-sm text-gray-300">Target Audience</p>
                    <p className="font-semibold text-lg">{course.audience}</p>
                  </div>
                </div>
                {course.format && (
                  <div className="flex items-center space-x-4">
                    <BookOpen className="h-6 w-6 text-yellow-400" />
                    <div>
                      <p className="text-sm text-gray-300">Format</p>
                      <p className="font-semibold text-lg">{course.format}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center space-x-4">
                  <Shield className="h-6 w-6 text-yellow-400" />
                  <div>
                    <p className="text-sm text-gray-300">Compliance</p>
                    <p className="font-semibold text-lg">WorkSafeBC Approved</p>
                  </div>
                </div>
                {course.passing_grade && (
                  <div className="flex items-center space-x-4">
                    <Award className="h-6 w-6 text-yellow-400" />
                    <div>
                      <p className="text-sm text-gray-300">Passing Grade</p>
                      <p className="font-semibold text-lg">{course.passing_grade}</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="pt-6 border-t border-gray-700">
                <a 
                  href="#request-syllabus"
                  className="w-full block text-center bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-4 rounded-lg font-bold text-lg transition-all duration-200 transform hover:scale-105"
                >
                  Request Syllabus
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section id="request-syllabus" className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">Get Started Today</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-10">
              Contact us to schedule this course for your team or to join an upcoming session.
            </p>
            
            <div className="rounded-2xl p-8 shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row items-center justify-center gap-8">
              <a href="tel:250-615-3727" className="flex items-center space-x-4 text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 transition-colors">
                <Phone className="h-8 w-8" />
                <span className="font-bold text-2xl">250-615-3727</span>
              </a>
              <div className="border-l border-gray-300 dark:border-gray-600 h-12 hidden md:block"></div>
              <a href="mailto:info@karmatraining.ca" className="flex items-center space-x-4 text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 transition-colors">
                <Mail className="h-8 w-8" />
                <span className="font-bold text-2xl">info@karmatraining.ca</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}