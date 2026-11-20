import React from 'react';
import { Search, Filter, ArrowUpDown } from 'lucide-react';

export default function CategoryFilter({
  categories = [],
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortChange
}) {
  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-6">
      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
        <button
          type="button"
          onClick={() => onSelectCategory('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-750'
          }`}
        >
          All Habits
        </button>

        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => onSelectCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-750'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search, Status, and Sort controls */}
      <div className="flex items-center gap-2">
        {/* Search Input */}
        <div className="relative flex-1 sm:w-56">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search habits..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-800/90 border border-slate-750 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Status Filter (All / Pending / Done) */}
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="px-2.5 py-1.5 bg-slate-800/90 border border-slate-750 rounded-xl text-xs font-medium text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
        >
          <option value="all">All Status</option>
          <option value="pending">⏳ Pending Today</option>
          <option value="completed">✅ Done Today</option>
        </select>

        {/* Sort selector */}
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="px-2.5 py-1.5 bg-slate-800/90 border border-slate-750 rounded-xl text-xs font-medium text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
        >
          <option value="streak">🔥 By Streak</option>
          <option value="title">🔤 By Name</option>
          <option value="created">🕒 By Created</option>
        </select>
      </div>
    </div>
  );
}
