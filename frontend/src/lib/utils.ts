import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines class names into a single string with deduplication and conditional classes support.
 * It uses `clsx` to parse the inputs and `twMerge` to merge Tailwind CSS classes intelligently.
 * @param inputs - An array of class values which can be strings, objects, or arrays.
 * @returns A single, merged string of class names.
 * 
 * Example:
 * ```
 * const buttonClass = cn('btn', { 'btn-primary': isPrimary, 'btn-large': isLarge });
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function convertToAscii(inputString: string) {
  // remove non ascii characters
  return inputString.replace(/[^\x00-\x7F]+/g, "");
  
}