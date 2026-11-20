import React from 'react';
import {
  Check,
  Flame,
  Trophy,
  MoreVertical,
  Pencil,
  Trash2,
  Calendar,
  Sparkles,
  Zap,
  Target,
  Brain,
  Droplets,
  BookOpen,
  Heart,
  Briefcase,
  Activity
} from 'lucide-react';
import WeeklyProgressBar from './WeeklyProgressBar';

// Icon mapping helper
const getHabitIcon = (iconName) => {
  switch (iconName) {
    case 'flame': return Flame;
    case 'brain': return Brain;
    case 'zap': return Zap;
    case 'book-open': return BookOpen;
    case 'droplets': return Droplets;
    case 'heart': return Heart;
    case 'briefcase': return Briefcase;
    case 'activity': return Activity;
    case 'target':
    default:
      return Target;
  }
};

export default function HabitCard({
  habit,
  onToggleToday,
  onToggleDay,
  onEdit,
  onDelete
}) {
  const IconComponent = getHabitIcon(habit.icon);
  const isCompletedToday = habit.completed_today;

  return (
    <div
      className={`group relative rounded-2xl p-5 transition-all duration-300 border flex flex-col justify-between ${
        isCompletedToday
          ? 'bg-gradient-to-b from-slate-800/95 to-slate-900/95 border-slate-700/80 shadow-lg shadow-black/20'
          : 'bg-slate-850/80 hover:bg-slate-800/90 border-slate-800 hover:border-slate-700/80 shadow-md'
      }`}
      style={{
        borderLeft: `4px solid ${habit.color || '#3B82F6'}`
      }}
    >
      {/* Top Header Row: Category Badge & Actions */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Category Tag */}
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium tracking-wide border"
              style={{
                backgroundColor: `${habit.color}15`,
                color: habit.color,
                borderColor: `${habit.color}30`
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: habit.color }}
              />
              {habit.category}
            </span>

            {/* Target Frequency Badge */}
            <span className="text-[11px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-750">
              {habit.target_days_per_week === 7 ? 'Every day' : `${habit.target_days_per_week}d / wk`}
            </span>
          </div>

          {/* Action Buttons (Edit / Delete) */}
          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => onEdit(habit)}
              className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-750 rounded-lg transition-colors"
              title="Edit habit"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(habit)}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-750 rounded-lg transition-colors"
              title="Delete habit"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Habit Main Info & Big Check-in Row */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-white tracking-tight leading-snug truncate group-hover:text-indigo-200 transition-colors">
              {habit.title}
            </h3>
            {habit.description && (
              <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {habit.description}
              </p>
            )}
          </div>

          {/* Daily Check-in Button */}
          <button
            type="button"
            onClick={() => onToggleToday(habit.id)}
            title={isCompletedToday ? 'Mark as incomplete today' : 'Check-in for today!'}
            className={`relative shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 transform active:scale-90 cursor-pointer ${
              isCompletedToday
                ? 'shadow-lg ring-2 ring-emerald-500/30'
                : 'border-2 border-slate-700 bg-slate-800/60 hover:border-slate-500 hover:bg-slate-750 text-slate-500'
            }`}
            style={
              isCompletedToday
                ? {
                    backgroundColor: habit.color || '#10B981',
                    boxShadow: `0 4px 15px ${habit.color || '#10B981'}50`
                  }
                : {}
            }
          >
            {isCompletedToday ? (
              <Check className="w-7 h-7 text-white stroke-[3] animate-in zoom-in-50 duration-200" />
            ) : (
              <div className="w-5 h-5 rounded-md border-2 border-dashed border-slate-500 hover:border-slate-300 transition-colors" />
            )}
          </button>
        </div>

        {/* Streaks and Completion Metrics */}
        <div className="grid grid-cols-3 gap-2 py-3 px-3.5 mb-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
          {/* Current Streak */}
          <div className="flex items-center gap-2">
            <div
              className={`p-1.5 rounded-lg ${
                habit.current_streak > 0
                  ? 'bg-amber-500/15 text-amber-400'
                  : 'bg-slate-800 text-slate-500'
              }`}
            >
              <Flame
                className={`w-4 h-4 ${
                  habit.current_streak > 0 ? 'fill-amber-400 text-amber-400 animate-pulse' : ''
                }`}
              />
            </div>
            <div>
              <div className="text-xs font-bold text-white leading-none">
                {habit.current_streak} {habit.current_streak === 1 ? 'day' : 'days'}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Current</div>
            </div>
          </div>

          {/* Longest Streak */}
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/15 text-indigo-400">
              <Trophy className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <div className="text-xs font-bold text-white leading-none">
                {habit.longest_streak} {habit.longest_streak === 1 ? 'day' : 'days'}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Record</div>
            </div>
          </div>

          {/* Total Check-ins */}
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400">
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="text-xs font-bold text-white leading-none">
                {habit.total_completions}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Total Logs</div>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Progress Bar Section (Mon-Sun) */}
      <div className="mt-2 pt-3 border-t border-slate-800">
        <WeeklyProgressBar
          weeklyProgress={habit.weekly_progress}
          habitColor={habit.color}
          onToggleDay={onToggleDay}
          habitId={habit.id}
        />
      </div>
    </div>
  );
}
