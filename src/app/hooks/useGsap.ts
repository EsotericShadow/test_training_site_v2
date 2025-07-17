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
  });

  return ref;
};
