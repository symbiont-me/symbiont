import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { UserAuth } from "@/app/context/AuthContext";
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

export function truncateFileName(fileName: string) {
  if (!fileName) return "";
  return fileName.length > 20
    ? fileName.substring(0, 20) + "..." + fileName.slice(-10)
    : fileName;
}

// NOTE won't work because useContext is a hook and can't be used outside of a component
// export async function getUserAuthToken() {
//   const authContext = UserAuth();
//   if (authContext?.user?.getIdToken) {
//     const token = await authContext.user.getIdToken();
//     return token;
//   }
// }
