import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  user: {
    id?: string;
    firstName?: string;
    lastName?: string;
    avatar?: string | null;
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
};

/**
 * Generates a DiceBear avatar URL based on user ID
 * Uses "adventurer" style for fun, colorful avatars
 */
function generateAvatarUrl(userId: string): string {
  // Use adventurer style - fun and colorful cartoon avatars
  return `https://api.dicebear.com/7.x/adventurer/svg?seed=${userId}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
}

export function UserAvatar({ user, className, size = 'md' }: UserAvatarProps) {
  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || '?';
  const avatarUrl = user.avatar || (user.id ? generateAvatarUrl(user.id) : null);

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      {avatarUrl && <AvatarImage src={avatarUrl} alt={`${user.firstName} ${user.lastName}`} />}
      <AvatarFallback className="bg-gradient-to-br from-[#1B5E3D] to-[#3D9A6A] text-white font-semibold">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}

export { generateAvatarUrl };
