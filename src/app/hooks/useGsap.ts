/*
 * Karma Industrial Safety Training Website
 * Written and developed by Gabriel Lacroix for Evergreen Web Solutions
 *
 * File: src/app/hooks/useGsap.ts
 * Description: Custom React hook for integrating GSAP animations with React components, ensuring proper cleanup.
 * Dependencies: React, GSAP, ScrollTrigger
 * Created: 2025-07-17
 * Last Modified: 2025-08-03
 * Version: 1.0.4
 */
'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const useGsap = (animation: (ref: React.RefObject<HTMLDivElement | null>) => void) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ctx: gsap.Context;
    if (ref.current) {
      ctx = gsap.context(() => {
        animation(ref);
      }, ref);
    }
    return () => {
      if (ctx) ctx.revert();
    };
  }, [animation]);

  return ref;
};

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