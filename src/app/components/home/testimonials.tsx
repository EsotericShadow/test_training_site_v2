import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Star, Camera } from 'lucide-react';

// TypeScript interfaces for our data
interface Testimonial {
  id: string;
  clientName: string;
  clientRole: string;
  company: string;
  industry: string;
  content: string;
  rating: number;
  clientPhoto?: string;
}

export default function Testimonials() {
  // Hardcoded testimonials data
  const testimonials: Testimonial[] = [
    {
      id: '1',
      clientName: 'Sarah Mitchell',
      clientRole: 'Safety Manager',
      company: 'Northern Mining Corp',
      industry: 'Mining',
      content: 'Karma Training provided exceptional safety training for our mining operations. Their instructors brought real-world experience and made complex safety concepts easy to understand. Our incident rates have significantly decreased since implementing their training programs.',
      rating: 5
    },
    {
      id: '2',
      clientName: 'Mike Thompson',
      clientRole: 'Operations Director',
      company: 'BC Forest Solutions',
      industry: 'Forestry',
      content: 'The KIST Fall Protection course was exactly what our forestry crew needed. The hands-on training with actual equipment gave our workers confidence and practical skills they use every day. Highly recommend Karma Training for any forestry operation.',
      rating: 5
    },
    {
      id: '3',
      clientName: 'Jennifer Lee',
      clientRole: 'HR Director',
      company: 'Industrial Solutions Ltd',
      industry: 'Industrial',
      content: 'We\'ve worked with Karma Training for over three years now. Their flexibility in scheduling and willingness to conduct on-site training has been invaluable. The quality of instruction and certification process is top-notch.',
      rating: 5
    }
  ];

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
            Hear from industry leaders who trust Karma Training for their workplace safety needs
          </p>
        </div>

        {/* Industry Filter Display */}
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

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
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
                  {testimonial.clientPhoto ? (
                    <Image
                      src={testimonial.clientPhoto}
                      alt={`${testimonial.clientName} - ${testimonial.clientRole}`}
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
                    {testimonial.clientName}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {testimonial.clientRole}
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