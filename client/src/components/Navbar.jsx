import React from 'react';
import {
  Flame,
  Plus,
  LayoutDashboard,
  CalendarDays,
  Sparkles,
  Wifi,
  WifiOff
} from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  onOpenCreateModal,
  isOnline = true,
  habitsCount = 0
}) {
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Flame className="w-6 h-6 text-white fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-white">
                Habit<span className="text-indigo-400">Flow</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                PRO
              </span>
            </div>
            <p className="hidden sm:block text-[11px] text-slate-400 leading-none">
              Daily Goal & Streak Engine
            </p>
          </div>
        </div>

        {/* Center: Navigation Tabs (Dashboard vs History) */}
        <div className="flex items-center p-1 bg-slate-800/90 rounded-xl border border-slate-750">
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Historical Trends</span>
          </button>
        </div>

        {/* Right: Date, Status, and Action Button */}
        <div className="flex items-center gap-3">
          {/* Online/Offline Status Indicator */}
          <div
            className={`hidden md:flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-medium border ${
              isOnline
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
            }`}
            title={isOnline ? 'Connected to local SQLite database' : 'Backend offline or unreachable'}
          >
            {isOnline ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Synced</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-rose-400" />
                <span>Offline</span>
              </>
            )}
          </div>

          {/* Current Date Badge */}
          <div className="hidden lg:block text-xs font-medium text-slate-400 bg-slate-800/60 px-2.5 py-1.5 rounded-xl border border-slate-750">
            📅 {todayFormatted}
          </div>

          {/* New Habit Button */}
          <button
            type="button"
            onClick={onOpenCreateModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-lg shadow-indigo-600/30 transition-all transform active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">New Habit</span>
          </button>
        </div>
      </div>
    </header>
  );
}
