'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Phone, Mail, MapPin, Clock } from 'lucide-react'
import SecureContactForm from '@/app/components/forms/SecureContactForm'

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
  phone?: string;
  email?: string;
  location?: string;
  business_hours?: string;
  response_time?: string;
  service_area?: string;
  emergency_availability?: string;
}

export default function ContactPage() {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/company-info')
      .then(res => res.json())
      .then(data => {
        if (data.companyInfo) {
          setCompanyInfo(data.companyInfo);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching company info:', error);
        setLoading(false);
      });
  }, []);

  // Fallback data
  const fallbackInfo = {
    company_name: 'Karma Training',
    slogan: 'We guarantee a response to all inquiries within 24 hours',
    description: 'Ready to enhance your workplace safety? Get in touch with our expert team for training, consultation, or custom course development.',
    phone: '250-615-3727',
    email: 'info@karmatraining.ca',
    location: 'Northwestern British Columbia',
    business_hours: 'Monday - Friday: 8:00 AM - 5:00 PM',
    response_time: '24hr',
    service_area: 'NW BC',
    emergency_availability: 'Emergency training available on weekends'
  };

  // Use CMS data or fallback
  const displayInfo = companyInfo || fallbackInfo;

  const handleFormSuccess = () => {
    setFormSuccess(true);
    setFormError(null);
    
    // Reset success message after 5 seconds
    setTimeout(() => {
      setFormSuccess(false);
    }, 5000);
  };

  const handleFormError = (error: string) => {
    setFormError(error);
    setFormSuccess(false);
    
    // Clear error after 10 seconds
    setTimeout(() => {
      setFormError(null);
    }, 10000);
  };

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
            <h1 className="text-5xl font-bold mb-6">Contact {displayInfo.company_name}</h1>
            <p className="text-xl text-gray-300 leading-relaxed mb-8">
              {displayInfo.description}
            </p>
            <div className="mb-8">
              <p className="text-brand-yellow font-medium text-lg italic">
                &quot;{displayInfo.slogan}&quot;
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-brand-yellow mb-2">{displayInfo.response_time || '24hr'}</div>
                <div className="text-gray-300">Response Time</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-brand-yellow mb-2">On-Site</div>
                <div className="text-gray-300">Training Available</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-brand-yellow mb-2">{displayInfo.service_area || 'NW BC'}</div>
                <div className="text-gray-300">Service Area</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Information & Secure Form */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          {/* Success/Error Messages */}
          {formSuccess && (
            <div className="max-w-4xl mx-auto mb-8 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-green-700 dark:text-green-400 font-semibold text-center">
                ✅ Message sent successfully! We&apos;ll get back to you within {displayInfo.response_time || '24 hours'}.
              </p>
            </div>
          )}

          {formError && (
            <div className="max-w-4xl mx-auto mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-700 dark:text-red-400 font-semibold text-center">
                ❌ {formError}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Get In Touch</h2>
              
              <div className="space-y-6 mb-8">
                <div className="flex items-start space-x-4 p-4 bg-white dark:bg-gray-900 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="bg-brand-yellow/20 rounded-full p-3">
                    <Phone className="h-6 w-6 text-brand-yellow" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Phone</h3>
                    <p className="text-gray-600 dark:text-gray-400">{displayInfo.phone || '250-615-3727'}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">{displayInfo.business_hours || 'Monday - Friday, 8:00 AM - 5:00 PM'}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4 p-4 bg-white dark:bg-gray-900 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="bg-brand-yellow/20 rounded-full p-3">
                    <Mail className="h-6 w-6 text-brand-yellow" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Email</h3>
                    <p className="text-gray-600 dark:text-gray-400">{displayInfo.email || 'info@karmatraining.ca'}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">We respond within {displayInfo.response_time || '24 hours'}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4 p-4 bg-white dark:bg-gray-900 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="bg-brand-yellow/20 rounded-full p-3">
                    <MapPin className="h-6 w-6 text-brand-yellow" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Service Area</h3>
                    <p className="text-gray-600 dark:text-gray-400">{displayInfo.location || 'Northwestern British Columbia'}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">On-site training at your facility</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4 p-4 bg-white dark:bg-gray-900 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="bg-brand-yellow/20 rounded-full p-3">
                    <Clock className="h-6 w-6 text-brand-yellow" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Business Hours</h3>
                    <p className="text-gray-600 dark:text-gray-400">{displayInfo.business_hours || 'Monday - Friday: 8:00 AM - 5:00 PM'}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">{displayInfo.emergency_availability || 'Emergency training available on weekends'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-brand-yellow/10 border-l-4 border-brand-yellow p-6 rounded-r-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Quick Response Guarantee</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  We understand that safety training is often time-sensitive. We guarantee a response 
                  to all inquiries within {displayInfo.response_time || '24 hours'} and can often accommodate urgent training requests.
                </p>
              </div>
            </div>

            {/* Secure Contact Form */}
            <SecureContactForm 
              onSuccess={handleFormSuccess}
              onError={handleFormError}
            />
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
            <Link 
              href="/courses"
              className="bg-brand-yellow hover:bg-brand-yellow-dark text-black px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg"
            >
              View Our Courses
            </Link>
            <a 
              href={`tel:${displayInfo.phone || '250-615-3727'}`}
              className="border-2 border-white hover:bg-white hover:text-gray-900 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200"
            >
              Call {displayInfo.phone || '250-615-3727'}
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

