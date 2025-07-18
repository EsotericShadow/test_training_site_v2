import Image from 'next/image'
import Link from 'next/link'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showText?: boolean
}

export default function Logo({ size = 'md', className = '', showText = true }: LogoProps) {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-32 md:h-30'  // Responsive: smaller on mobile (h-32 = 128px, 25% smaller than 144), smaller on desktop (h-30 = 120px, ~15% smaller than 144)
  }

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl md:text-4xl'  // Responsive text sizing
  }

  // Calculate dimensions based on size
  const getWidth = (sizeKey: 'sm' | 'md' | 'lg', isMobile = false): number => {
    if (sizeKey === 'sm') return 120;
    if (sizeKey === 'md') return 150;
    // lg size
    return isMobile ? Math.round(455 * 0.75) : Math.round(455 * 0.85); // 341 for mobile, 387 for desktop
  };

  const getHeight = (sizeKey: 'sm' | 'md' | 'lg', isMobile = false): number => {
    if (sizeKey === 'sm') return 32;
    if (sizeKey === 'md') return 48;
    // lg size
    return isMobile ? Math.round(144 * 0.75) : Math.round(144 * 0.85); // 108 for mobile, 122 for desktop
  };

  return (
    <Link href="/" className={`flex items-center space-x-3 group ${className}`}>
      <div className="relative">
        {size === 'lg' ? (
          <>
            {/* Mobile logo - 25% smaller */}
            <Image
              src="/assets/logos/logo.png"
              alt="Karma Training Logo"
              width={getWidth(size, true)}
              height={getHeight(size, true)}
              className="h-32 w-auto transition-transform duration-300 group-hover:scale-105 md:hidden"
              priority
              quality={60}
            />
            {/* Desktop logo - 15% smaller */}
            <Image
              src="/assets/logos/logo.png"
              alt="Karma Training Logo"
              width={getWidth(size, false)}
              height={getHeight(size, false)}
              className="hidden md:block h-30 w-auto transition-transform duration-300 group-hover:scale-105"
              priority
              quality={60}
            />
          </>
        ) : (
          <Image
            src="/assets/logos/logo.png"
            alt="Karma Training Logo"
            width={getWidth(size)}
            height={getHeight(size)}
            className={`${sizeClasses[size]} w-auto transition-transform duration-300 group-hover:scale-105`}
            priority
            quality={60}
          />
        )}
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold text-gray-900 dark:text-white ${textSizeClasses[size]} leading-tight`}>
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

