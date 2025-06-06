import { Camera } from 'lucide-react'

export default function TrainingShowcase() {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Training in <span className="text-brand-yellow">Action</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            See our professional training environment and hands-on learning approach 
            that prepares students for real-world safety challenges.
          </p>
        </div>
        
        {/* Photo Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Large Featured Photo */}
          <div className="md:col-span-2 lg:col-span-2 lg:row-span-2">
            <div className="bg-gray-300 dark:bg-gray-700 rounded-xl h-96 lg:h-full flex items-center justify-center group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="text-center text-gray-600 dark:text-gray-400">
                <Camera className="h-12 w-12 mx-auto mb-4 text-brand-yellow" />
                <p className="text-lg font-medium">Main Training Photo</p>
                <p className="text-sm">Hands-on safety instruction</p>
              </div>
            </div>
          </div>
          
          {/* Smaller Photos */}
          <div className="bg-gray-300 dark:bg-gray-700 rounded-xl h-44 flex items-center justify-center group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="text-center text-gray-600 dark:text-gray-400">
              <Camera className="h-8 w-8 mx-auto mb-2 text-brand-yellow" />
              <p className="font-medium">Equipment Training</p>
            </div>
          </div>
          
          <div className="bg-gray-300 dark:bg-gray-700 rounded-xl h-44 flex items-center justify-center group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="text-center text-gray-600 dark:text-gray-400">
              <Camera className="h-8 w-8 mx-auto mb-2 text-brand-yellow" />
              <p className="font-medium">Classroom Session</p>
            </div>
          </div>
          
          <div className="md:col-span-2 lg:col-span-1">
            <div className="bg-gray-300 dark:bg-gray-700 rounded-xl h-44 flex items-center justify-center group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="text-center text-gray-600 dark:text-gray-400">
                <Camera className="h-8 w-8 mx-auto mb-2 text-brand-yellow" />
                <p className="font-medium">Certification Ceremony</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-lg max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Experience Professional Safety Training
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Join hundreds of professionals who have enhanced their safety knowledge 
              and earned industry-recognized certifications with Karma Training.
            </p>
            <button className="bg-brand-yellow hover:bg-brand-yellow-dark text-gray-900 px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg">
              Schedule Your Training
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}