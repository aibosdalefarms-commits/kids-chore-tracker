import { useMemo } from 'react';
import type { AvatarConfig } from '../../types';
import { avatarService } from '../../services/avatar';

interface AvatarDisplayProps {
  config: AvatarConfig;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-10 h-10',
  md: 'w-16 h-16',
  lg: 'w-24 h-24',
  xl: 'w-32 h-32',
};

export function AvatarDisplay({ config, size = 'md', className = '' }: AvatarDisplayProps) {
  const avatarUrl = useMemo(() => {
    return avatarService.getAvatarUrl(config);
  }, [config]);

  return (
    <div
      className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100 ${className}`}
    >
      <img
        src={avatarUrl}
        alt="Avatar"
        className="w-full h-full object-cover"
      />
    </div>
  );
}
