import React from 'react';
import { Target, Plus, Sparkles } from 'lucide-react';

export default function EmptyState({
  isFiltered,
  onResetFilters,
  onOpenCreate
}) {
  return (
    <div className="py-16 px-6 text-center rounded-3xl bg-slate-850/60 border border-slate-800 border-dashed flex flex-col items-center justify-center max-w-lg mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4 ring-8 ring-indigo-500/5">
        <Target className="w-8 h-8" />
      </div>

      <h3 className="text-lg font-bold text-white mb-2">
        {isFiltered ? 'No matching habits found' : 'Start Your Habit Journey'}
      </h3>

      <p className="text-sm text-slate-400 mb-6 max-w-sm leading-relaxed">
        {isFiltered
          ? 'No habits match your active category, status, or search filters. Try adjusting them or clear filters.'
          : 'Track your daily rituals, build powerful streaks, and turn small daily actions into massive life-changing results.'}
      </p>

      {isFiltered ? (
        <button
          type="button"
          onClick={onResetFilters}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-indigo-300 bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 transition-all cursor-pointer"
        >
          Reset All Filters
        </button>
      ) : (
        <button
          type="button"
          onClick={onOpenCreate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Create Your First Habit</span>
        </button>
      )}
    </div>
  );
}
