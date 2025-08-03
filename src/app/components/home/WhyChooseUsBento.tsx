/*
 * Karma Industrial Safety Training Website
 * Written and developed by Gabriel Lacroix for Evergreen Web Solutions
 *
 * File: WhyChooseUsBento.tsx
 * Description: Bento grid component showcasing company advantages and unique selling points.
 * Dependencies: React 19, CSS Grid
 * Created: June 3, 2025
 * Last Modified: August 3, 2025
 * Version: 1.0.0
 */
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
  const itemHistoryRef = useRef<Set<string>[]>([]); // Track last 2 cycles of text points
  const imageHistoryRef = useRef<Set<string>[]>([]); // Track last 2 cycles of images
  const [bentoSlots, setBentoSlots] = useState<BentoSlot[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  const getSlots = useCallback(() => {
    const newSlots: BentoSlot[] = [];
    let availableItems = [...items];
    let availableImages = [...courseImages];
    const recentItems = new Set<string>(itemHistoryRef.current.flatMap(set => [...set]));
    const recentImages = new Set<string>(imageHistoryRef.current.flatMap(set => [...set]));

    const selectItems = <T,>(
      pool: T[],
      count: number,
      getId: (item: T) => string,
      recentIds: Set<string>
    ): T[] => {
      const selected: T[] = [];
      let candidates = pool.filter(item => !recentIds.has(getId(item))); // Prefer non-recent items
      if (candidates.length < count) candidates = pool; // Fallback to all items if needed

      for (let i = 0; i < count && candidates.length > 0; i++) {
        const randomIndex = Math.floor(Math.random() * candidates.length);
        const selectedItem = candidates[randomIndex];
        if (selectedItem) { // Ensure selectedItem is defined
          selected.push(selectedItem);
          candidates = candidates.filter((_, idx) => idx !== randomIndex); // Remove selected item
        }
      }

      return selected;
    };

    // Select 2 items for text slots
    const textItems = selectItems(
      availableItems,
      Math.min(2, availableItems.length),
      item => item.point,
      recentItems
    );
    availableItems = availableItems.filter(item => !textItems.includes(item));

    // Select 4 items for image slots
    const imageItems = selectItems(
      availableItems,
      Math.min(4, availableItems.length),
      item => item.point,
      recentItems
    );
    availableItems = availableItems.filter(item => !imageItems.includes(item));

    // Select 6 images for all slots
    const allImages = selectItems(
      availableImages,
      Math.min(6, availableImages.length),
      img => img.url,
      recentImages
    );
    availableImages = availableImages.filter(img => !allImages.includes(img));

    // Create text slots
    textItems.forEach((item, index) => {
      const assignedImage = allImages[index] || { url: FALLBACK_IMAGE, alt: FALLBACK_ALT };
      newSlots.push({
        id: `slot-text-${item.id ?? 'unknown'}-${Date.now()}-${index}`,
        type: 'text',
        item: {
          ...item,
          image_url: assignedImage.url,
          image_alt: assignedImage.alt,
        },
      });
    });

    // Fill remaining text slots with fallbacks if needed
    while (newSlots.length < 2 && items.length > 0) {
      const fallbackItem = items[Math.floor(Math.random() * items.length)] || {
        point: 'More insights!',
        image_url: FALLBACK_IMAGE,
        image_alt: FALLBACK_ALT,
      };
      const assignedImage = allImages[newSlots.length] || { url: FALLBACK_IMAGE, alt: FALLBACK_ALT };
      newSlots.push({
        id: `slot-fallback-text-${Date.now()}-${newSlots.length}`,
        type: 'text',
        item: {
          point: fallbackItem.point,
          image_url: assignedImage.url,
          image_alt: assignedImage.alt,
        },
      });
    }

    // Create image slots
    imageItems.forEach((item, index) => {
      const assignedImage = allImages[index + 2] || { url: FALLBACK_IMAGE, alt: FALLBACK_ALT };
      newSlots.push({
        id: `slot-image-${item.id ?? 'unknown'}-${Date.now()}-${index}`,
        type: 'image',
        item: {
          ...item,
          image_url: assignedImage.url,
          image_alt: assignedImage.alt,
        },
      });
    });

    // Fill remaining image slots with fallbacks if needed
    while (newSlots.length < 6 && items.length > 0) {
      const fallbackItem = items[Math.floor(Math.random() * items.length)] || {
        point: 'Explore more!',
        image_url: FALLBACK_IMAGE,
        image_alt: FALLBACK_ALT,
      };
      const assignedImage = allImages[newSlots.length] || { url: FALLBACK_IMAGE, alt: FALLBACK_ALT };
      newSlots.push({
        id: `slot-fallback-image-${Date.now()}-${newSlots.length}`,
        type: 'image',
        item: {
          point: fallbackItem.point,
          image_url: assignedImage.url,
          image_alt: assignedImage.alt,
        },
      });
    }

    // Update history
    const currentItemIds = new Set(newSlots.map(slot => slot.item.point));
    const currentImageIds = new Set(newSlots.map(slot => slot.item.image_url).filter(Boolean) as string[]);
    itemHistoryRef.current = [...itemHistoryRef.current, currentItemIds].slice(-2); // Keep last 2 cycles
    imageHistoryRef.current = [...imageHistoryRef.current, currentImageIds].slice(-2); // Keep last 2 cycles

    // Shuffle slots to randomize positions
    const shuffleArray = (array: BentoSlot[]): BentoSlot[] => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = shuffled[i];
        shuffled[i] = shuffled[j]!;
        shuffled[j] = temp!;
      }
      return shuffled;
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
                quality={75}
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