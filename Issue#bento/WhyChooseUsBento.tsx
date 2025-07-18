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
  const [bentoSlots, setBentoSlots] = useState<BentoSlot[]>([]);
  const [sequenceIndex, setSequenceIndex] = useState(0);

  // The fixed sequence is now directly the 'items' prop, which should contain 30 items
  const fixedSequence = useCallback(() => {
    return items; 
  }, [items]);

  const getSequentialSlots = useCallback(() => {
    const sequence = fixedSequence();
    if (sequence.length === 0) return [];

    const currentSlice: WhyChooseUsItem[] = [];
    for (let i = 0; i < 6; i++) {
      currentSlice.push(sequence[(sequenceIndex + i) % sequence.length]);
    }

    const newSlots: BentoSlot[] = [];
    const usedItemIds = new Set<number | undefined>();

    // Create mutable copies for selection
    let availableForText = [...currentSlice];
    let availableForImage = [...currentSlice];

    // Select 2 items for text slots
    for (let i = 0; i < 2; i++) {
      let selectedItem: WhyChooseUsItem | undefined;
      // Prioritize items without images for text slots
      const textPreferredIndex = availableForText.findIndex(item => !item.image_url && !usedItemIds.has(item.id));
      if (textPreferredIndex !== -1) {
        selectedItem = availableForText[textPreferredIndex];
        availableForText.splice(textPreferredIndex, 1); // Remove from available
      } else {
        // Fallback: take any available item not yet used
        const anyAvailableIndex = availableForText.findIndex(item => !usedItemIds.has(item.id));
        if (anyAvailableIndex !== -1) {
          selectedItem = availableForText[anyAvailableIndex];
          availableForText.splice(anyAvailableIndex, 1); // Remove from available
        }
      }

      if (selectedItem) {
        newSlots.push({
          id: `slot-${selectedItem.id}-text-${sequenceIndex + i}`,
          type: 'text',
          item: selectedItem,
        });
        usedItemIds.add(selectedItem.id);
      } else {
        // Fallback if not enough unique items for text slots
        newSlots.push({
          id: `slot-fallback-text-${Date.now()}-${i}`,
          type: 'text',
          item: { point: 'More insights!', image_url: FALLBACK_IMAGE, image_alt: FALLBACK_ALT },
        });
      }
    }

    // Select 4 items for image slots
    for (let i = 0; i < 4; i++) {
      let selectedItem: WhyChooseUsItem | undefined;
      // Prioritize items with images for image slots
      const imagePreferredIndex = availableForImage.findIndex(item => item.image_url && !usedItemIds.has(item.id));
      if (imagePreferredIndex !== -1) {
        selectedItem = availableForImage[imagePreferredIndex];
        availableForImage.splice(imagePreferredIndex, 1); // Remove from available
      } else {
        // Fallback: take any available item not yet used
        const anyAvailableIndex = availableForImage.findIndex(item => !usedItemIds.has(item.id));
        if (anyAvailableIndex !== -1) {
          selectedItem = availableForImage[anyAvailableIndex];
          availableForImage.splice(anyAvailableIndex, 1); // Remove from available
        }
      }

      if (selectedItem) {
        newSlots.push({
          id: `slot-${selectedItem.id}-image-${sequenceIndex + i}`,
          type: 'image',
          item: selectedItem,
        });
        usedItemIds.add(selectedItem.id);
      } else {
        // Fallback if not enough unique items for image slots
        newSlots.push({
          id: `slot-fallback-image-${Date.now()}-${i}`,
          type: 'image',
          item: { point: 'Explore more!', image_url: FALLBACK_IMAGE, image_alt: FALLBACK_ALT },
        });
      }
    }

    // Shuffle the final slots to randomize their positions in the grid
    const shuffleArray = (array: BentoSlot[]) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    };

    return shuffleArray(newSlots);
  }, [fixedSequence, sequenceIndex]);

  useEffect(() => {
    // Initial generation of slots
    setBentoSlots(getSequentialSlots());

    const interval = setInterval(() => {
      setSequenceIndex(prevIndex => (prevIndex + 6) % fixedSequence().length);
      setBentoSlots(getSequentialSlots());
    }, 10000); // Change items every 10 seconds

    return () => clearInterval(interval);
  }, [getSequentialSlots, fixedSequence]);

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
