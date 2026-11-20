import React from 'react';
import {
  CheckCircle2,
  Flame,
  Trophy,
  Zap,
  Target
} from 'lucide-react';

export default function StatsHeader({ habits = [] }) {
  const totalHabits = habits.length;
  const completedToday = habits.filter(h => h.completed_today).length;
  const completionPercent = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

  const activeStreaksCount = habits.filter(h => h.current_streak > 0).length;
  const maxCurrentStreak = habits.reduce((max, h) => Math.max(max, h.current_streak || 0), 0);
  const bestAllTimeStreak = habits.reduce((max, h) => Math.max(max, h.longest_streak || 0), 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. Today's Progress Card */}
      <div className="p-4 rounded-2xl bg-slate-850/80 border border-slate-800 relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400">Today's Progress</span>
          <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl font-black text-white">{completedToday}</span>
          <span className="text-xs text-slate-400 font-medium">/ {totalHabits} completed</span>
          <span className="ml-auto text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            {completionPercent}%
          </span>
        </div>
        {/* Progress bar */}
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
      </div>

      {/* 2. Active Streaks */}
      <div className="p-4 rounded-2xl bg-slate-850/80 border border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400">Active Streaks</span>
          <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-400">
            <Flame className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-white">{activeStreaksCount}</span>
          <span className="text-xs text-slate-400 font-medium">habits burning 🔥</span>
        </div>
        <p className="text-[11px] text-slate-500 mt-2">
          {totalHabits > 0
            ? `${Math.round((activeStreaksCount / totalHabits) * 100)}% of your habits have active streaks`
            : 'No habits yet'}
        </p>
      </div>

      {/* 3. Top Current Streak */}
      <div className="p-4 rounded-2xl bg-slate-850/80 border border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400">Top Current Streak</span>
          <div className="p-1.5 rounded-lg bg-indigo-500/15 text-indigo-400">
            <Zap className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-white">{maxCurrentStreak}</span>
          <span className="text-xs text-slate-400 font-medium">days in a row</span>
        </div>
        <p className="text-[11px] text-slate-500 mt-2">
          Keep the momentum alive today!
        </p>
      </div>

      {/* 4. All-Time Record */}
      <div className="p-4 rounded-2xl bg-slate-850/80 border border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400">All-Time Record</span>
          <div className="p-1.5 rounded-lg bg-purple-500/15 text-purple-400">
            <Trophy className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-white">{bestAllTimeStreak}</span>
          <span className="text-xs text-slate-400 font-medium">days max streak</span>
        </div>
        <p className="text-[11px] text-slate-500 mt-2">
          Personal best habit consistency
        </p>
      </div>
    </div>
  );
}
