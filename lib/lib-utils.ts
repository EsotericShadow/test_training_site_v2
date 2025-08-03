/*
 * Evergreen Web Solutions
 * Written and developed by Gabriel Lacroix
 *
 * File: lib-utils.ts
 * Description: This script provides a collection of utility functions that are used throughout the application.
 * These functions are designed to be small, reusable, and have no side effects.
 *
 * Dependencies:
 * - clsx: A utility for constructing className strings conditionally.
 * - tailwind-merge: A utility for merging Tailwind CSS classes in JS without style conflicts.
 *
 * Created: 2025-07-18
 * Last Modified: 2025-07-18
 * Version: 1.0.1
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * @function cn
 * @description A utility function that combines class names using clsx and tailwind-merge.
 * This is the standard `cn` function used in shadcn/ui components and is a convenient way to apply conditional classes.
 * @param {...ClassValue[]} inputs - A list of class names to be combined.
 * @returns {string} The combined class names.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * @function formatPrice
 * @description Returns a static string for displaying the price of a course.
 * This is used in a lead capture model where the price is not displayed directly.
 * @returns {string} The static price string.
 */
export function formatPrice(): string {
  return "Contact for Pricing";
}

/**
 * @function formatDuration
 * @description Formats a duration from hours to a human-readable string.
 * This is used for displaying the duration of a course in the course catalogue.
 * @param {number} hours - The duration in hours.
 * @returns {string} The formatted duration string.
 */
export function formatDuration(hours: number): string {
  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    return `${minutes} min`;
  } else if (hours === 1) {
    return '1 hour';
  } else {
    return `${hours} hours`;
  }
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