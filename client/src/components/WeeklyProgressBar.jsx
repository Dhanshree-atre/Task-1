import React from 'react';
import { Check, Circle } from 'lucide-react';

export default function WeeklyProgressBar({
  weeklyProgress = [],
  habitColor = '#3B82F6',
  onToggleDay = null,
  habitId = null
}) {
  const completedCount = weeklyProgress.filter(d => d.completed).length;
  const totalDays = weeklyProgress.length || 7;
  const percentage = Math.round((completedCount / totalDays) * 100);

  return (
    <div className="w-full space-y-2.5">
      {/* Progress bar text and mini percentage */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span className="font-medium text-slate-300">Week Progress (Mon–Sun)</span>
        <span className="font-semibold text-slate-200">
          {completedCount}/{totalDays} <span className="text-slate-500 font-normal">({percentage}%)</span>
        </span>
      </div>

      {/* Visual horizontal track */}
      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${percentage}%`,
            backgroundColor: habitColor
          }}
        />
      </div>

      {/* Mon - Sun individual day nodes */}
      <div className="grid grid-cols-7 gap-1.5 pt-1">
        {weeklyProgress.map((day) => {
          const isClickable = onToggleDay && !day.isFuture;

          return (
            <button
              key={day.date}
              type="button"
              disabled={day.isFuture || !onToggleDay}
              onClick={() => isClickable && onToggleDay(habitId, day.date)}
              title={`${day.dayName} (${day.date}): ${
                day.completed ? 'Completed' : day.isFuture ? 'Upcoming' : 'Missed (Click to toggle)'
              }`}
              className={`group flex flex-col items-center justify-center p-1.5 rounded-lg transition-all duration-200 ${
                day.isToday
                  ? 'bg-slate-800/90 ring-1.5 ring-indigo-500/60 shadow-sm'
                  : 'bg-slate-800/40 hover:bg-slate-800/70'
              } ${isClickable ? 'cursor-pointer active:scale-95' : 'cursor-default'}`}
            >
              {/* Day Name (M, T, W, etc.) */}
              <span
                className={`text-[10px] font-semibold mb-1 uppercase tracking-wider ${
                  day.isToday
                    ? 'text-indigo-400 font-bold'
                    : 'text-slate-400 group-hover:text-slate-200'
                }`}
              >
                {day.dayName.slice(0, 1)}
              </span>

              {/* Status Indicator Icon / Circle */}
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                  day.completed
                    ? 'text-white shadow-sm'
                    : day.isToday
                    ? 'border-2 border-dashed border-indigo-400 text-indigo-300 bg-indigo-500/10'
                    : day.isFuture
                    ? 'border border-slate-700/60 text-slate-600 bg-transparent'
                    : 'border border-slate-700 text-slate-500 bg-slate-800/50 hover:border-slate-500'
                }`}
                style={
                  day.completed
                    ? { backgroundColor: habitColor, boxShadow: `0 0 10px ${habitColor}40` }
                    : {}
                }
              >
                {day.completed ? (
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                ) : (
                  <span className="text-[10px] font-medium text-slate-400">
                    {day.dayNumber}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
