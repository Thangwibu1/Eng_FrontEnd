import { useMyStreak } from '../hooks/useMyStreak';

interface StreakChipProps {
  variant?: 'sidebar' | 'simple';
}

export function StreakChip({ variant = 'sidebar' }: StreakChipProps) {
  const { data, isLoading } = useMyStreak();

  if (isLoading || !data) return null;

  if (variant === 'simple') {
    return (
      <span className="bg-[#FEF9E6] text-amber-800 border border-amber-200/50 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-0.5 shadow-sm">
        🔥 {data.currentStreak}
      </span>
    );
  }

  return (
    <div className="bg-[#FEF9E6] border border-amber-100/60 p-3 rounded-2xl flex items-center justify-between shadow-sm animate-fade-in">
      <span className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
        <span className="text-base">🔥</span> {data.currentStreak} day streak
      </span>
      <span className="text-[9px] font-extrabold text-amber-700 bg-white/70 px-2 py-0.5 rounded-full">
        Best: {data.bestStreak}
      </span>
    </div>
  );
}
