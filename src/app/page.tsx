import HeroSection from '@/app/components/home/hero-section'
import FeaturedCourses from '@/app/components/home/featured-courses'
import AboutSnippet from '@/app/components/home/about-snippet'
import Testimonials from '@/app/components/home/testimonials'

export default function Home() {
  return (
    <div>
      <HeroSection />
      <AboutSnippet />
      <FeaturedCourses />
      <Testimonials />
    </div>
  )
}