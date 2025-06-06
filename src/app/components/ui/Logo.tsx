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
    lg: 'h-16'
  }

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  }

  return (
    <Link href="/" className={`flex items-center space-x-3 group ${className}`}>
      <div className="relative">
        <Image
          src="/assets/logos/logo.png"
          alt="Karma Training Logo"
          width={size === 'sm' ? 120 : size === 'md' ? 150 : 200}
          height={size === 'sm' ? 32 : size === 'md' ? 48 : 64}
          className={`${sizeClasses[size]} w-auto transition-transform duration-300 group-hover:scale-105`}
          priority
        />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold text-gray-900 dark:text-white ${textSizeClasses[size]} leading-tight`}>
            Industrial Safety
          </span>
          <span className={`text-gray-600 dark:text-gray-400 ${size === 'sm' ? 'text-sm' : 'text-base'} leading-tight`}>
            Northwestern BC
          </span>
        </div>
      )}
    </Link>
  )
}

