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

interface BentoSlot {
  id: string; // Unique ID for the slot, for Flip animations
  type: 'text' | 'image';
  item: WhyChooseUsItem;
}

interface WhyChooseUsBentoProps {
  items: WhyChooseUsItem[];
}

const FALLBACK_IMAGE = 'https://bluvpssu00ym8qv7.public.blob.vercel-storage.com/other/placeholder-image.webp'; // Placeholder image URL
const FALLBACK_ALT = 'Placeholder image';

export default function WhyChooseUsBento({ items }: WhyChooseUsBentoProps) {
  const bentoRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<Set<string>[]>([]);
  const [bentoSlots, setBentoSlots] = useState<BentoSlot[]>([]);

  // Log the items prop when the component mounts or items change
  useEffect(() => {
    console.log("WhyChooseUsBento received items:", items);
  }, [items]);

  const originals = items.filter(item => item.point && !item.point.startsWith('Discover More About Us -'));
  const generics = items.filter(item => item.point && item.point.startsWith('Discover More About Us -'));

  const getSlots = useCallback(() => {
    const newSlots: BentoSlot[] = [];
    const usedItemIds = new Set<number | undefined>();
    const recentImages = new Set<string>(historyRef.current.flatMap(set => [...set]));

    // Helper to randomly select from an array
    const pickRandom = (arr: WhyChooseUsItem[]): WhyChooseUsItem | undefined => {
      if (arr.length === 0) return undefined;
      const randIdx = Math.floor(Math.random() * arr.length);
      const selected = arr[randIdx];
      arr.splice(randIdx, 1);
      return selected;
    };

    // Prepare preferred and fallback for originals (for text slots)
    const preferredOriginals = originals.filter(item => item.image_url && !recentImages.has(item.image_url));
    const fallbackOriginals = originals.filter(item => item.image_url && recentImages.has(item.image_url));

    // Select 2 items for text slots: Prioritize originals not in recent
    for (let i = 0; i < 2; i++) {
      let selectedItem: WhyChooseUsItem | undefined;

      selectedItem = pickRandom(preferredOriginals);
      if (!selectedItem) {
        selectedItem = pickRandom(fallbackOriginals);
      }

      if (!selectedItem) {
        newSlots.push({
          id: `slot-fallback-text-${Date.now()}-${i}`,
          type: 'text',
          item: { point: 'More insights!', image_url: FALLBACK_IMAGE, image_alt: FALLBACK_ALT },
        });
        continue;
      }

      newSlots.push({
        id: `slot-${selectedItem.id ?? 'unknown'}-text-${i}`,
        type: 'text',
        item: selectedItem,
      });
      usedItemIds.add(selectedItem.id);
    }

    // Prepare preferred and fallback for generics (for image slots)
    const preferredGenerics = generics.filter(item => item.image_url && !recentImages.has(item.image_url));
    const fallbackGenerics = generics.filter(item => item.image_url && recentImages.has(item.image_url));

    // Select 4 items for image slots: Prioritize generics not in recent
    for (let i = 0; i < 4; i++) {
      let selectedItem: WhyChooseUsItem | undefined;

      selectedItem = pickRandom(preferredGenerics);
      if (!selectedItem) {
        selectedItem = pickRandom(fallbackGenerics);
      }

      if (!selectedItem) {
        newSlots.push({
          id: `slot-fallback-image-${Date.now()}-${i}`,
          type: 'image',
          item: { point: 'Explore more!', image_url: FALLBACK_IMAGE, image_alt: FALLBACK_ALT },
        });
        continue;
      }

      newSlots.push({
        id: `slot-${selectedItem.id ?? 'unknown'}-image-${i}`,
        type: 'image',
        item: selectedItem,
      });
      usedItemIds.add(selectedItem.id);
    }

    // Shuffle the final slots to randomize their positions in the grid
    const shuffleArray = (array: BentoSlot[]) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i]!;
        array[i] = array[j]!;
        array[j] = temp;
      }
      return array;
    };

    console.log("Generated Slots:", newSlots);
    return shuffleArray(newSlots);
  }, [items]); // Depend on items, but since static, fine

  useEffect(() => {
    const regenerate = () => {
      const newSlots = getSlots();
      setBentoSlots(newSlots);

      // Update history with displayed image_urls
      const displayedImages = new Set(newSlots.map(slot => slot.item.image_url).filter(Boolean) as string[]);
      historyRef.current = [...historyRef.current, displayedImages].slice(-3);
    };

    regenerate(); // Initial

    const interval = setInterval(regenerate, 10000); // Regenerate every 10 seconds

    return () => clearInterval(interval);
  }, [getSlots]);

  useEffect(() => {
    if (!bentoRef.current || bentoSlots.length === 0) return;

    const state = Flip.getState(bentoRef.current.children);

    Flip.from(state, {
      duration: 0.7,
      ease: 'power2.inOut',
      stagger: 0.05,
    });
  }, [bentoSlots]);

  if (items.length === 0) {
    return null;
  }

  return (
    <div ref={bentoRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-fr">
      {bentoSlots.map((slot) => (
        <div
          key={slot.id}
          className={`relative bg-white dark:bg-gray-900 p-8 rounded-lg shadow-lg flex flex-col justify-between overflow-hidden
            ${slot.type === 'image' ? 'aspect-square' : ''} // Make image slots square
          `}
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
                <div className="absolute inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center p-4">
                  <h3 className="text-2xl font-semibold text-white text-center">{slot.item.point}</h3>
                </div>
              )}
            </div>
          )}
          {(!slot.item.image_url || (slot.type === 'text' && !slot.item.image_url)) && (
            <div className="relative z-10 flex flex-col justify-center items-center h-full text-center">
              <h3 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">{slot.item.point || 'No content'}</h3>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}