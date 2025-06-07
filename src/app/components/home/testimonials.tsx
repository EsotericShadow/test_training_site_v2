'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Star, Camera } from 'lucide-react';

// TypeScript interfaces for our data
interface Testimonial {
  id: number;
  client_name: string;
  client_role: string;
  company: string;
  industry: string;
  content: string;
  rating: number;
  client_photo_url?: string;
  featured: boolean;
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/testimonials')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // Show featured testimonials first, then others
          const sortedTestimonials = data.sort((a, b) => {
            if (a.featured && !b.featured) return -1;
            if (!a.featured && b.featured) return 1;
            return 0;
          });
          setTestimonials(sortedTestimonials);
        } else {
          console.error('Expected array from /api/testimonials, got:', data);
          setError('Failed to load testimonials');
          setTestimonials([]);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching testimonials:', error);
        setError('Failed to load testimonials');
        setTestimonials([]);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="container mx-auto px-4 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-yellow"></div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="container mx-auto px-4 text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </section>
    );
  }

  // Get unique industries for filter display
  const industries = Array.from(new Set(testimonials.map(t => t.industry)));

  return (
    <section className="py-20 bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            What Our Clients Say
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Hear from industry leaders who trust Karma Training for their workplace safety needs!
          </p>
        </div>

        {/* Industry Filter Display */}
        {industries.length > 0 && (
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {industries.map((industry, index) => (
              <span 
                key={index}
                className="px-4 py-2 bg-brand-yellow/10 text-brand-yellow rounded-full text-sm font-medium"
              >
                {industry}
              </span>
            ))}
          </div>
        )}

        {/* Testimonials Grid */}
        {testimonials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                {/* Featured Badge */}
                {testimonial.featured && (
                  <div className="mb-4">
                    <span className="bg-brand-yellow text-black px-3 py-1 rounded-full text-xs font-semibold">
                      Featured
                    </span>
                  </div>
                )}

                {/* Rating Stars */}
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-5 w-5 ${
                        i < testimonial.rating 
                          ? 'text-brand-yellow fill-current' 
                          : 'text-gray-300 dark:text-gray-600'
                      }`} 
                    />
                  ))}
                </div>

                {/* Testimonial Content */}
                <blockquote className="text-gray-700 dark:text-gray-300 mb-6 italic leading-relaxed">
                  {testimonial.content}
                </blockquote>

                {/* Client Info */}
                <div className="flex items-center space-x-4">
                  {/* Client Photo */}
                  <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                    {testimonial.client_photo_url ? (
                      <Image
                        src={testimonial.client_photo_url}
                        alt={`${testimonial.client_name} - ${testimonial.client_role}`}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="bg-gray-200 dark:bg-gray-700 h-full w-full flex items-center justify-center">
                        <Camera className="h-5 w-5 text-brand-yellow" />
                      </div>
                    )}
                  </div>

                  {/* Client Details */}
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {testimonial.client_name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {testimonial.client_role}
                    </div>
                    <div className="text-sm text-brand-yellow font-medium">
                      {testimonial.company}
                    </div>
                  </div>
                </div>

                {/* Industry Badge */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span className="inline-block px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium">
                    {testimonial.industry} Industry
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">No testimonials available at this time.</p>
          </div>
        )}

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-gray-900 to-black dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">
            Ready to Join Our Satisfied Clients?
          </h3>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Experience the difference that expert safety training can make for your organization. 
            Contact us today to discuss your training needs.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/contact"
              className="inline-flex items-center justify-center space-x-2 bg-brand-yellow hover:bg-brand-yellow-dark text-black px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:-translate-y-1"
            >
              <span>Get a Quote</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            
            <Link 
              href="/courses"
              className="inline-flex items-center justify-center space-x-2 border-2 border-white hover:bg-white hover:text-black text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:-translate-y-1"
            >
              <span>View Courses</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

