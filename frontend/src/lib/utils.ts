import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getAvatarUrl(avatarPath: string | null | undefined, userId?: string): string {
  if (!avatarPath) {
    // Generate a fun DiceBear avatar if no avatar is set
    if (userId) {
      return `https://api.dicebear.com/7.x/adventurer/svg?seed=${userId}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
    }
    return '';
  }
  if (avatarPath.startsWith('http')) return avatarPath;
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  return `${apiUrl}${avatarPath}`;
}

/**
 * Generate a DiceBear avatar URL for a user
 * Uses "adventurer" style for fun, colorful cartoon avatars
 */
export function generateDiceBearAvatar(seed: string): string {
  return `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
}
