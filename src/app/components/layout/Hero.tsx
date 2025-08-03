/*
 * Karma Industrial Safety Training Website
 * Written and developed by Gabriel Lacroix for Evergreen Web Solutions
 *
 * File: Hero.tsx
 * Description: Hero section component for page headers with background images and call-to-action elements.
 * Dependencies: React 19, Next.js Image
 * Created: June 3, 2025
 * Last Modified: August 3, 2025
 * Version: 1.0.0
 */
'use client';

import Image from 'next/image';

interface HeroProps {
  title: string;
  subtitle: string;
  imageUrl: string;
  imageAlt: string;
}

export default function Hero({ title, subtitle, imageUrl, imageAlt }: HeroProps) {
  return (
    <section className="relative text-white py-24 md:py-32">
      <div className="absolute inset-0">
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          className="object-cover opacity-30"
          priority
        />
      </div>
      <div className="relative container mx-auto px-4 text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold mb-4">{title}</h1>
        <p className="text-xl md:text-2xl text-yellow-400 font-semibold">{subtitle}</p>
      </div>
    </section>
  );
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
//                           \/                                       \/     \/                 