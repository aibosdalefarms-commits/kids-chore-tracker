import { useNavigate } from 'react-router-dom';
import type { Child } from '../../types';
import { AvatarDisplay } from '../avatar/AvatarDisplay';

interface ChildAvatarButtonProps {
  child: Child;
}

export function ChildAvatarButton({ child }: ChildAvatarButtonProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/child/${child.childId}`);
  };

  return (
    <button
      onClick={handleClick}
      className="
        flex flex-col items-center gap-3 p-6
        bg-white rounded-3xl shadow-lg
        hover:shadow-xl hover:scale-105
        active:scale-95
        transition-all duration-200
        min-w-[140px] min-h-[160px]
        focus:outline-none focus:ring-4 focus:ring-indigo-300
      "
      aria-label={`Open chore list for ${child.name}`}
    >
      <div className="relative">
        <AvatarDisplay config={child.avatarConfig} size="xl" />
        {/* Streak badge */}
        {child.currentStreak > 0 && (
          <div className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center shadow-md">
            🔥{child.currentStreak}
          </div>
        )}
      </div>
      <span className="text-lg font-semibold text-gray-800">{child.name}</span>
      <div className="flex items-center gap-1 text-sm text-indigo-600 font-medium">
        <span>⭐</span>
        <span>{child.individualPoints}</span>
      </div>
    </button>
  );
}
