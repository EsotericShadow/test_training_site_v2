/*
 * Karma Industrial Safety Training Website
 * Written and developed by Gabriel Lacroix for Evergreen Web Solutions
 *
 * File: Logo.tsx
 * Description: Reusable logo component with multiple size variants and optional text display.
 *              Features responsive sizing, hover animations, and optimized image loading
 *              for consistent branding across the application.
 * Dependencies: Next.js 15 Image and Link components
 * Created: June 3, 2025
 * Last Modified: August 3, 2025
 * Version: 1.0.0
 */
import Image from 'next/image'
import Link from 'next/link'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showText?: boolean
}

/**
 * Logo component with configurable sizing and text display options
 * 
 * WHY: Provides consistent branding across the application while allowing flexibility
 *      for different layout contexts and responsive design requirements
 * 
 * HOW: Uses Next.js optimized Image component with predefined size variants and
 *      conditional text display based on layout needs
 * 
 * WHAT: Renders the company logo with optional descriptive text and hover animations
 * 
 * @param {LogoProps} props - Component configuration options
 * @param {'sm'|'md'|'lg'} [props.size='md'] - Size variant for different contexts
 * @param {string} [props.className=''] - Additional CSS classes for styling
 * @param {boolean} [props.showText=true] - Whether to display company text alongside logo
 * @returns {JSX.Element} Clickable logo component linking to homepage
 */
export default function Logo({ size = 'md', className = '', showText = true }: LogoProps) {
  const sizeMap = {
    sm: { width: 120, height: 32, textSize: 'text-lg' },
    md: { width: 150, height: 80, textSize: 'text-xl' },
    lg: { width: 387, height: 122, textSize: 'text-3xl md:text-4xl' },
  }

  const { width, height, textSize } = sizeMap[size]

  return (
    <Link href="/" className={`flex items-center space-x-3 group ${className}`}>
      <div className="relative">
        <Image
          src="/assets/logos/logo.png"
          alt="Karma Training Logo"
          width={width}
          height={height}
          className="transition-transform duration-300 group-hover:scale-105 object-contain"
          priority
          quality={60}
          sizes="(max-width: 768px) 25vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold text-gray-900 dark:text-white ${textSize} leading-tight`}>
            Industrial Safety
          </span>
          <span className={`text-gray-600 dark:text-gray-400 ${size === 'sm' ? 'text-sm' : size === 'md' ? 'text-base' : 'text-lg md:text-xl'} leading-tight`}>
            Northwestern BC
          </span>
        </div>
      )}
    </Link>
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