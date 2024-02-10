import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
// import { promises as fs } from 'fs';

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
  return twMerge(clsx(inputs));
}
// removes non-ascii characters and replaces spaces with hyphens
// @note pinecone requires file names to be ascii only without spaces
export function removeNonAscii(inputString: string) {
  return inputString.replace(/[^\x00-\x7F]+/g, "").replace(/\s+/g, "-");
}

// export async function deleteFileFromFolder(fileName: string) {
//   try {
//     await fs.unlink(fileName);
//     console.log(`Deleted file: ${fileName}`);
//   } catch (error) {
//     console.error(`Error deleting file ${fileName}:`, error);
//   }
// }
