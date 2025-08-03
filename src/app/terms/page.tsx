/*
 * Karma Industrial Safety Training Website
 * Written and developed by Gabriel Lacroix for Evergreen Web Solutions
 *
 * File: src/app/terms/page.tsx
 * Description: Terms and conditions page server component that generates terms-focused SEO metadata
 *              and renders the terms and conditions content with structured data for legal compliance.
 * Dependencies: Next.js 15, React 19, custom LegalIcon component
 * Created: 2025-06-17
 * Last Modified: 2025-08-03
 * Version: 1.0.5
 */
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import LegalIcon from '../LegalIcons'

export default function TermsConditionsPage() {
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [heroImageAlt, setHeroImageAlt] = useState<string | null>(null);

  useEffect(() => {
    const fetchHeroImage = async () => {
      try {
        const response = await fetch('/api/adm_f7f8556683f1cdc65391d8d2_8e91/files?category=other');
        if (response.ok) {
          const { file } = await response.json();
          setHeroImage(file.blob_url);
          setHeroImageAlt(file.alt_text || 'Terms and conditions hero image');
        } else {
          console.error('Failed to load hero image');
          setHeroImage('https://bluvpssu00ym8qv7.public.blob.vercel-storage.com/other/1750011620811-IMG_8439.JPG'); // Fallback
          setHeroImageAlt('Safety training in action');
        }
      } catch (error) {
        console.error('Error fetching hero image:', error);
        setHeroImage('https://bluvpssu00ym8qv7.public.blob.vercel-storage.com/other/1750011620811-IMG_8439.JPG'); // Fallback
        setHeroImageAlt('Safety training in action');
      }
    };

    fetchHeroImage();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <section className="relative bg-gradient-to-br from-gray-900 to-black dark:from-black dark:to-gray-900 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          {heroImage && (
            <Image
              src={heroImage}
              alt={heroImageAlt || 'Hero background'}
              fill
              className="object-cover opacity-30"
              priority
              sizes="100vw"
            />
          )}
        </div>
        <div className="relative container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">Terms and Conditions</h1>
            <p className="text-xl text-gray-300 leading-relaxed mb-8">
              These terms govern your use of Karma Training’s website and services. By engaging with us, you agree to these conditions.
            </p>
            <p className="text-brand-yellow font-medium text-lg italic">
              Last Updated: June 17, 2025
            </p>
          </div>
        </div>
      </section>

      {/* Terms and Conditions Content */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Our Terms of Use</h2>
            <div className="space-y-8 text-gray-700 dark:text-gray-300">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">1. Use of the Site</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Eligibility</strong>: You must be 19 or older or have employer authorization to use this site, as our services are for industrial professionals.</li>
                  <li><strong>Acceptable Use</strong>: Use the site to inquire about training, consultation, or safety services. You may not:
                    <ul className="list-circle pl-6">
                      <li>Submit false information or impersonate others.</li>
                      <li>Attempt to hack, scrape, or access restricted areas (e.g., admin dashboards).</li>
                      <li>Reproduce or distribute site content without permission.</li>
                    </ul>
                  </li>
                  <li><strong>Monitoring</strong>: We track site activity to detect fraud or abuse. Misuse may result in legal action or restricted access.</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">2. Lead Capture and Communication</h3>
                <p>Our site collects contact information to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Respond to inquiries about KIST programs, IVES certifications, or custom training.</li>
                  <li>Provide quotes for on-site training or safety assessments.</li>
                  <li>Send marketing materials (opt-out available).</li>
                </ul>
                <p>By submitting information, you consent to communication from Karma Training. See our <Link href="/privacy-policy" className="text-brand-yellow hover:underline">Privacy Policy</Link> for data handling details.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">3. Training and Services</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Inquiries</strong>: Submitting a form does not guarantee service. Training is subject to availability, scheduling, and agreement on terms.</li>
                  <li><strong>Customization</strong>: We may develop custom courses or policies based on your company’s needs, subject to separate contracts.</li>
                  <li><strong>On-Site Delivery</strong>: Training occurs at your facility using your equipment, per our agreement.</li>
                  <li><strong>Cancellations</strong>: Cancellation policies for booked services will be outlined in the service agreement.</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">4. Intellectual Property</h3>
                <p>All content, including training program outlines, safety manuals, and consultation materials, is owned by Karma Training. You may not copy, share, or use this content for commercial purposes without written consent.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">5. Limitation of Liability</h3>
                <p>The site is provided “as is.” We are not liable for:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Errors or interruptions in site access.</li>
                  <li>Losses from decisions made based on site content.</li>
                  <li>Indirect or consequential damages from using our services.</li>
                </ul>
                <p>Karma Training’s total liability for any claim will not exceed the amount paid for services.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">6. Indemnification</h3>
                <p>You agree to indemnify Karma Training against claims arising from your misuse of the site, violation of these terms, or infringement of third-party rights.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">7. Termination</h3>
                <p>We may block your access to the site for violations, such as submitting fraudulent information or attempting unauthorized access, without prior notice.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">8. Third-Party Links</h3>
                <p>Our site may contain links to third-party websites. We are not responsible for their content, policies, or practices. Accessing these links is at your own risk.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">9. Dispute Resolution</h3>
                <p>Any disputes arising from these terms will first be addressed through good-faith negotiation. If unresolved, disputes will be settled by arbitration in British Columbia, Canada, under BC arbitration rules. You waive any right to class action lawsuits.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">10. Governing Law</h3>
                <p>These terms are governed by the laws of British Columbia, Canada. Disputes will be resolved in BC courts, except as provided in the Dispute Resolution section.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">11. Force Majeure</h3>
                <p>Karma Training is not liable for delays or failures in performance due to events beyond our control, including natural disasters, strikes, or government actions.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">12. Severability</h3>
                <p>If any provision of these terms is found unenforceable, the remaining provisions will remain in full effect.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">13. Accessibility</h3>
                <p>We strive to make our site accessible to all users, including those with disabilities, in compliance with applicable accessibility standards. Contact us if you encounter accessibility issues.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">14. Changes to Terms</h3>
                <p>We may update these terms. Changes will be posted here with a revised date. Continued use of the site after changes constitutes acceptance.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">15. Contact Us</h3>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4 p-4 bg-white dark:bg-gray-900 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="bg-brand-yellow/20 rounded-full p-3">
                      <LegalIcon name="mail" className="h-6 w-6 text-brand-yellow" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Email</h4>
                      <p className="text-gray-600 dark:text-gray-400">info@karmatraining.ca</p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">We respond within 24 hours</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4 p-4 bg-white dark:bg-gray-900 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="bg-brand-yellow/20 rounded-full p-3">
                      <LegalIcon name="map-pin" className="h-6 w-6 text-brand-yellow" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Service Area</h4>
                      <p className="text-gray-600 dark:text-gray-400">Northwestern British Columbia</p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">On-site training at your facility</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-black dark:from-black dark:to-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Partner with Karma Training</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Inquire about our industrial safety training or custom solutions for your business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/contact"
              className="inline-flex items-center justify-center space-x-2 bg-amber-400 hover:bg-amber-500 text-black px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg"
           >
              Request a Quote
            </Link>
            <a 
              href="tel:250-615-3727"
              className="inline-flex items-center justify-center space-x-2 bg-transparent border-2 border-amber-400 hover:bg-amber-400 hover:text-black text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg"
           >
              Call 250-615-3727
            </a>
          </div>
        </div>
      </section>
    </div>
  )
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