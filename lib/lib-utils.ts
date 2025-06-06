import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names using clsx and tailwind-merge
 * This is the standard cn function used in shadcn/ui components
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Returns "Contact for Pricing" for lead capture model
 */
export function formatPrice(): string {
  return "Contact for Pricing";
}

/**
 * Formats duration from hours to human-readable string
 * For displaying course duration in your catalogue
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