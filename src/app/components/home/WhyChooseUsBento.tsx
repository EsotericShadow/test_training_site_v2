'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { Flip } from 'gsap/Flip';

gsap.registerPlugin(Flip);

interface WhyChooseUsItem {
  id?: number;
  point: string;
  image_url?: string;
  image_alt?: string;
}

interface CourseImage {
  url: string;
  alt: string;
}

interface BentoSlot {
  id: string;
  type: 'text' | 'image';
  item: WhyChooseUsItem;
}

interface WhyChooseUsBentoProps {
  items: WhyChooseUsItem[];
  courseImages: CourseImage[];
}

const FALLBACK_IMAGE = '/assets/logos/logo.png';
const FALLBACK_ALT = 'Placeholder image';

export default function WhyChooseUsBento({ items, courseImages }: WhyChooseUsBentoProps) {
  const bentoRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<Set<string>[]>([]);
  const [bentoSlots, setBentoSlots] = useState<BentoSlot[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  const getSlots = useCallback(() => {
    const newSlots: BentoSlot[] = [];
    const availableItemsForThisCycle = [...items];
    let availableImages = [...courseImages];
    const recentImages = new Set<string>(historyRef.current.flatMap(set => [...set]));

    const pickAndReturnRemaining = <T,>(
      pool: T[],
      filterFn: (item: T) => boolean
    ): { selected: T | undefined, remaining: T[] } => {
      const filteredPool = pool.filter(filterFn);
      if (filteredPool.length === 0) return { selected: undefined, remaining: pool };

      const randIdx = Math.floor(Math.random() * filteredPool.length);
      const selected = filteredPool[randIdx];
      const remaining = selected ? pool.filter((_, i) => i !== pool.indexOf(selected)) : pool;
      return { selected, remaining };
    };

    // Select 2 items for text slots
    for (let i = 0; i < 2; i++) {
      const { selected: selectedItem, remaining } = pickAndReturnRemaining(availableItemsForThisCycle, item => !!item.point);
      availableItemsForThisCycle.length = 0;
      availableItemsForThisCycle.push(...remaining);

      if (!selectedItem) {
        newSlots.push({
          id: `slot-fallback-text-${Date.now()}-${i}`,
          type: 'text',
          item: { point: 'More insights!', image_url: FALLBACK_IMAGE, image_alt: FALLBACK_ALT },
        });
        continue;
      }

      // Assign a course image if none exists
      if (!selectedItem.image_url && availableImages.length > 0) {
        const { selected: imgSelected, remaining: imgRemaining } = pickAndReturnRemaining(availableImages, img => !recentImages.has(img.url));
        if (imgSelected) {
          selectedItem.image_url = imgSelected.url;
          selectedItem.image_alt = imgSelected.alt;
          availableImages = imgRemaining;
        }
      }

      newSlots.push({
        id: `slot-${selectedItem.id ?? 'unknown'}-text-${i}`,
        type: 'text',
        item: selectedItem,
      });
    }

    // Select 4 items for image slots
    for (let i = 0; i < 4; i++) {
      const { selected: selectedItem, remaining } = pickAndReturnRemaining(availableItemsForThisCycle, item => !!item.point);
      availableItemsForThisCycle.length = 0;
      availableItemsForThisCycle.push(...remaining);

      if (!selectedItem) {
        newSlots.push({
          id: `slot-fallback-image-${Date.now()}-${i}`,
          type: 'image',
          item: { point: 'Explore more!', image_url: FALLBACK_IMAGE, image_alt: FALLBACK_ALT },
        });
        continue;
      }

      // Assign a course image if none exists
      if (!selectedItem.image_url && availableImages.length > 0) {
        const { selected: imgSelected, remaining: imgRemaining } = pickAndReturnRemaining(availableImages, img => !recentImages.has(img.url));
        if (imgSelected) {
          selectedItem.image_url = imgSelected.url;
          selectedItem.image_alt = imgSelected.alt;
          availableImages = imgRemaining;
        }
      }

      newSlots.push({
        id: `slot-${selectedItem.id ?? 'unknown'}-image-${i}`,
        type: 'image',
        item: selectedItem,
      });
    }

    const shuffleArray = (array: BentoSlot[]) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i]!;
        array[i] = array[j]!;
        array[j] = temp;
      }
      return array;
    };

    return shuffleArray(newSlots);
  }, [items, courseImages]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry) {
          setIsVisible(entry.isIntersecting);
        }
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.1,
      }
    );

    const currentRef = bentoRef.current;

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isVisible) {
      const regenerate = () => {
        const newSlots = getSlots();
        setBentoSlots(newSlots);

        const displayedImages = new Set(newSlots.map(slot => slot.item.image_url).filter(Boolean) as string[]);
        historyRef.current = [...historyRef.current, displayedImages].slice(-3);
      };

      regenerate();
      interval = setInterval(regenerate, 10000);
    }

    return () => clearInterval(interval);
  }, [isVisible, getSlots]);

  useEffect(() => {
    if (!bentoRef.current || bentoSlots.length === 0 || !isVisible) return;

    const state = Flip.getState(bentoRef.current.children);

    Flip.from(state, {
      duration: 0.7,
      ease: 'power2.inOut',
      stagger: 0.05,
    });
  }, [bentoSlots, isVisible]);

  if (items.length === 0) {
    return null;
  }

  return (
    <div ref={bentoRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-fr">
      {bentoSlots.map((slot) => (
        <div
          key={slot.id}
          className={`relative backdrop-blur-md bg-gray-800/80 border border-gray-700 p-8 rounded-xl shadow-xl flex flex-col justify-between overflow-hidden
            ${slot.type === 'image' ? 'aspect-square' : ''}`}
        >
          {slot.item.image_url && (
            <div className="absolute inset-0">
              <Image
                src={slot.item.image_url}
                alt={slot.item.image_alt || slot.item.point || FALLBACK_ALT}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
              />
              {slot.type === 'text' && (
                <div className="absolute inset-0 bg-gray-900/70 flex items-center justify-center p-4">
                  <h3 className="text-2xl font-semibold text-white text-center">{slot.item.point}</h3>
                </div>
              )}
            </div>
          )}
          {!slot.item.image_url && (
            <div className="relative z-10 flex flex-col justify-center items-center h-full text-center">
              <Image
                src={FALLBACK_IMAGE}
                alt={FALLBACK_ALT}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
                quality={60}
              />
              <div className="absolute inset-0 bg-gray-900/70 flex items-center justify-center p-4">
                <h3 className="text-2xl font-semibold text-white text-center">{slot.item.point || 'No content'}</h3>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}