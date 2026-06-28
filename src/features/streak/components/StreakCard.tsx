import { useMyStreak } from '../hooks/useMyStreak';
import { Award, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

export function StreakCard() {
  const { data, isLoading } = useMyStreak();

  if (isLoading) {
    return (
      <div className="bg-[#FEF9E6] border border-amber-100 rounded-3xl p-6 md:p-8 shadow-soft animate-pulse flex items-center justify-center">
        <span className="text-xs font-bold text-amber-800">Loading streak data...</span>
      </div>
    );
  }

  const currentStreak = data?.currentStreak ?? 0;
  const bestStreak = data?.bestStreak ?? 0;
  const weekDays = data?.week || [];

  return (
    <section className="bg-[#FEF9E6] border border-amber-100 rounded-3xl p-6 md:p-8 shadow-soft flex flex-col lg:flex-row items-center justify-between gap-6 hover:scale-[1.01] transition duration-300">
      <div className="flex items-center gap-4 flex-col sm:flex-row text-center sm:text-left">
        {/* Trophy badge inside circle */}
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-amber-500 shadow-sm shrink-0 border border-amber-100/50">
          <Award className="w-8 h-8 fill-current" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-black text-text-primary flex items-center justify-center sm:justify-start gap-1">
            {currentStreak > 0 ? (
              <>
                You're on fire! <span className="animate-bounce">🔥</span>
              </>
            ) : (
              <>
                Start your streak! <span className="text-base">🎯</span>
              </>
            )}
          </h3>
          <p className="text-xs font-extrabold text-text-secondary leading-normal">
            {currentStreak} day streak <span className="text-text-muted">•</span> Best: {bestStreak} days
          </p>
        </div>
      </div>

      {/* Monday - Sunday calendars match image 8 */}
      <div className="flex flex-wrap items-center justify-center gap-3 md:gap-5 flex-grow max-w-lg">
        {weekDays.map((day, idx) => {
          const isToday = day.label === 'Today';
          return (
            <div key={day.date || idx} className="flex flex-col items-center gap-1.5">
              <div className={`aspect-square w-10 md:w-11 rounded-full flex items-center justify-center transition-all duration-300 ${
                day.active
                  ? 'bg-[#FEF3C7] text-amber-700 shadow-soft border border-amber-200/50'
                  : isToday
                  ? 'bg-white border-2 border-brand-pink text-brand-pink font-extrabold'
                  : 'bg-white border border-gray-150 text-text-muted'
              }`}>
                {day.active ? (
                  <Check className="w-4.5 h-4.5 stroke-[3px] text-amber-700" />
                ) : isToday ? (
                  <Check className="w-4.5 h-4.5 stroke-[3px] text-brand-pink" />
                ) : (
                  <span className="text-[10px] font-extrabold">{idx + 1}</span>
                )}
              </div>
              <span className={`text-[10px] font-extrabold block ${
                isToday ? 'text-brand-pink font-black' : 'text-text-muted'
              }`}>
                {day.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* View Progress Button */}
      <Link
        to="/readings"
        className="px-5 py-3 bg-[#FEF3C7] hover:bg-[#FDEBB3] text-amber-900 font-extrabold text-xs rounded-full transition shadow-sm flex items-center gap-1.5 shrink-0"
      >
        <svg className="w-4 h-4 text-amber-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
        View Progress
      </Link>
    </section>
  );
}
