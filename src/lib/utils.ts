import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function cleanFirestoreData(obj: any) {
  if (obj === null || typeof obj !== 'object') return obj;
  
  const newObj = { ...obj };
  Object.keys(newObj).forEach((key) => {
    if (newObj[key] === undefined) {
      delete newObj[key];
    } else if (typeof newObj[key] === 'object' && newObj[key] !== null && !(newObj[key] instanceof Date)) {
      // Recursively clean nested objects, but skip common Firestore types if needed
      // For now, simple one-level clean is usually enough for most of our flat types,
      // but let's make it slightly more robust.
      if (!newObj[key].constructor || newObj[key].constructor.name === 'Object') {
        newObj[key] = cleanFirestoreData(newObj[key]);
      }
    }
  });
  return newObj;
}
