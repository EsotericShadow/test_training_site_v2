/*
 * Evergreen Web Solutions
 * Written and developed by Gabriel Lacroix
 *
 * File: page.tsx
 * Description: To be filled in with the script's purpose
 * Dependencies: To be filled in with key dependencies or modules
 * Created: August 2, 2025
 * Last Modified: August 2, 2025
 * Version: 1.0.0
 */
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import LegalIcon from '../LegalIcons'

export default function PrivacyPolicyPage() {
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [heroImageAlt, setHeroImageAlt] = useState<string | null>(null);

  useEffect(() => {
    const fetchHeroImage = async () => {
      try {
        const response = await fetch('/api/adm_f7f8556683f1cdc65391d8d2_8e91/files?category=other');
        if (response.ok) {
          const { file } = await response.json();
          setHeroImage(file.blob_url);
          setHeroImageAlt(file.alt_text || 'Privacy policy hero image');
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
            <h1 className="text-5xl font-bold mb-6">Privacy Policy</h1>
            <p className="text-xl text-gray-300 leading-relaxed mb-8">
              At Karma Training, we value your trust. This Privacy Policy outlines how we collect, use, and protect your information to deliver tailored industrial safety training solutions.
            </p>
            <p className="text-brand-yellow font-medium text-lg italic">
              Last Updated: June 17, 2025
            </p>
          </div>
        </div>
      </section>

      {/* Privacy Policy Content */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Our Commitment to Your Privacy</h2>
            <div className="space-y-8 text-gray-700 dark:text-gray-300">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">1. Information We Collect</h3>
                <p>As a lead capture platform for industrial safety training, we collect:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Personal Information</strong>: Name, email address, phone number, company name, and job title when you submit contact forms, request quotes, or inquire about training, consultation, or custom course design.</li>
                  <li><strong>Training Preferences</strong>: Details about your training needs (e.g., KIST programs, IVES operator certification, safety assessments) to tailor our services.</li>
                  <li><strong>Usage Data</strong>: IP addresses, browser type, pages visited, and interactions with our site to improve user experience and prevent abuse.</li>
                  <li><strong>Cookies and Tracking</strong>: We use cookies and similar technologies to track site usage, enhance functionality, and monitor for fraudulent activity. You can manage cookie settings in your browser.</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">2. How We Use Your Information</h3>
                <p>We use your information to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Contact you to discuss training needs, provide quotes, or schedule on-site programs like KIST Fall Protection or IVES forklift certification.</li>
                  <li>Send marketing emails about new courses, safety assessments, or policy writing services (opt-out available).</li>
                  <li>Analyze site usage to improve content and user experience.</li>
                  <li>Prevent unauthorized access or abuse of our site, ensuring a secure experience.</li>
                  <li>Comply with legal obligations under Canadian privacy laws, including PIPEDA and British Columbia’s Personal Information Protection Act (PIPA).</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">3. Sharing Your Information</h3>
                <p>We do not sell, trade, or share your personal information with third parties, except:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>With trusted service providers (e.g., email platforms, CRM systems) who assist in delivering our services and are bound by strict confidentiality agreements.</li>
                  <li>To comply with legal requirements, such as responding to government requests or court orders.</li>
                  <li>To protect the safety, rights, or property of Karma Training and its users.</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">4. Data Retention</h3>
                <p>We retain personal information only as long as necessary to fulfill the purposes outlined in this policy or as required by law. For example, lead data may be kept for up to 2 years to follow up on inquiries, unless you request deletion.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">5. International Data Transfers</h3>
                <p>Your data is primarily stored and processed in Canada. If transferred to service providers outside Canada (e.g., cloud services), we ensure they meet equivalent privacy standards under PIPEDA and PIPA.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">6. Data Security</h3>
                <p>We use encryption, secure servers, and access controls to protect your data. While we strive to ensure security, no system is infallible, and we cannot guarantee absolute protection against unauthorized access.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">7. Your Privacy Rights</h3>
                <p>Under PIPEDA and PIPA, you can:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Request access to or correction of your personal information.</li>
                  <li>Request deletion of your data (subject to legal retention requirements).</li>
                  <li>Opt out of marketing communications at any time.</li>
                  <li>Disable cookies, though this may limit site functionality.</li>
                  <li>File a complaint if you believe your privacy rights have been violated.</li>
                </ul>
                <p>Email <a href="mailto:info@karmatraining.ca" className="text-brand-yellow hover:underline">info@karmatraining.ca</a> to exercise these rights.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">8. Third-Party Links</h3>
                <p>Our site may link to external sites (e.g., WorkSafeBC). We are not responsible for their privacy practices or content. Review their policies before sharing information.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">9. Children’s Privacy</h3>
                <p>Our services are designed for businesses and professionals. We do not knowingly collect data from individuals under 19 without employer authorization.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">10. Accessibility</h3>
                <p>We strive to make our site accessible to all users, including those with disabilities, in compliance with applicable accessibility standards. Contact us if you encounter accessibility issues.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">11. Policy Updates</h3>
                <p>We may update this policy to reflect changes in our practices or legal requirements. Updates will be posted here with a revised date. Continued use of our site constitutes acceptance.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">12. Contact Us</h3>
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
          <h2 className="text-3xl font-bold mb-4">Ready to Enhance Workplace Safety?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Contact us to discuss your training needs or learn more about our privacy practices.
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