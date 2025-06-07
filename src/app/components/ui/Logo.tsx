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
    lg: 'h-36'  // Increased from h-20 to h-36 (another 75% bigger)
  }

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-4xl'  // Increased from text-3xl to text-4xl
  }

  return (
    <Link href="/" className={`flex items-center space-x-3 group ${className}`}>
      <div className="relative">
        <Image
          src="/assets/logos/logo.png"
          alt="Karma Training Logo"
          width={size === 'sm' ? 120 : size === 'md' ? 150 : 455}  // Increased lg from 260 to 455 (another 75% bigger)
          height={size === 'sm' ? 32 : size === 'md' ? 48 : 144}   // Increased lg from 80 to 144 (another 75% bigger)
          className={`${sizeClasses[size]} w-auto transition-transform duration-300 group-hover:scale-105`}
          priority
        />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold text-gray-900 dark:text-white ${textSizeClasses[size]} leading-tight`}>
            Industrial Safety
          </span>
          <span className={`text-gray-600 dark:text-gray-400 ${size === 'sm' ? 'text-sm' : size === 'md' ? 'text-base' : 'text-xl'} leading-tight`}>
            Northwestern BC
          </span>
        </div>
      )}
    </Link>
  )
}

