import Image from 'next/image'
import Link from 'next/link'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showText?: boolean
}

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

