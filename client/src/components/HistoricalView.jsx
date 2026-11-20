import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Flame,
  Trophy,
  CheckCircle2,
  TrendingUp,
  Filter,
  Check,
  X,
  Clock,
  Sparkles,
  BarChart3,
  Layers
} from 'lucide-react';
import { habitsApi } from '../api/habitsApi';
import toast from 'react-hot-toast';

export default function HistoricalView({
  habits = [],
  onToggleHabitDate
}) {
  const [selectedHabitId, setSelectedHabitId] = useState('all');
  const [timeRangeDays, setTimeRangeDays] = useState(35);
  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);

  // Fetch history data whenever selected habit or time range changes
  const fetchHistory = async () => {
    try {
      setLoading(true);
      const habitId = selectedHabitId === 'all' ? null : selectedHabitId;
      const res = await habitsApi.getHistory(habitId, timeRangeDays);
      setHistoryData(res.data);

      // If a day was selected, refresh its details from the updated response
      if (selectedDay) {
        const updatedDay = res.data.days.find(d => d.date === selectedDay.date);
        if (updatedDay) {
          setSelectedDay(updatedDay);
        }
      }
    } catch (err) {
      toast.error('Failed to load historical data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [selectedHabitId, timeRangeDays]);

  // Handle toggling habit for a specific day from within the history inspector
  const handleToggleInHistory = async (habitId, date) => {
    try {
      await onToggleHabitDate(habitId, date);
      // Refresh history data
      await fetchHistory();
    } catch (err) {
      // Toast already shown in main hook
    }
  };

  const summary = historyData?.summary || {
    total_habits: habits.length,
    total_checkins: 0,
    best_streak: 0,
    overall_completion_rate: 0,
    active_streaks_count: 0
  };

  // Intensity color helper based on completion percentage
  const getIntensityClass = (rate, count) => {
    if (count === 0 || rate === 0) return 'bg-slate-800/80 border-slate-700/60 text-slate-500';
    if (rate < 35) return 'bg-emerald-950/80 border-emerald-800/70 text-emerald-400';
    if (rate < 70) return 'bg-emerald-800/80 border-emerald-600/70 text-emerald-200';
    if (rate < 100) return 'bg-emerald-600 border-emerald-500 text-white';
    return 'bg-emerald-500 border-emerald-400 text-white shadow-sm shadow-emerald-500/30';
  };

  return (
    <div className="space-y-6">
      {/* Top Controls: Habit Selector & Time Range Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-850/80 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Historical Trends & Heatmap</h2>
            <p className="text-xs text-slate-400">Track consistency, streaks, and completion patterns over time</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Habit Filter Dropdown */}
          <div className="relative">
            <select
              value={selectedHabitId}
              onChange={(e) => setSelectedHabitId(e.target.value)}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">📊 All Habits Aggregated</option>
              {habits.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.title}
                </option>
              ))}
            </select>
          </div>

          {/* Time Range Selector */}
          <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
            {[
              { label: '14d', value: 14 },
              { label: '35d', value: 35 },
              { label: '60d', value: 60 }
            ].map(({ label, value }) => (
              <button
                key={value}
                type="button"
                onClick={() => setTimeRangeDays(value)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  timeRangeDays === value
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Check-ins */}
        <div className="p-4 rounded-2xl bg-slate-850/70 border border-slate-800 flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-emerald-500/15 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-white tracking-tight">
              {summary.total_checkins}
            </div>
            <div className="text-xs font-medium text-slate-400">Total Check-ins</div>
          </div>
        </div>

        {/* Best Streak */}
        <div className="p-4 rounded-2xl bg-slate-850/70 border border-slate-800 flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-amber-500/15 text-amber-400">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-white tracking-tight">
              {summary.best_streak} <span className="text-xs font-normal text-slate-400">days</span>
            </div>
            <div className="text-xs font-medium text-slate-400">Best Streak Record</div>
          </div>
        </div>

        {/* Overall Completion Rate */}
        <div className="p-4 rounded-2xl bg-slate-850/70 border border-slate-800 flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-indigo-500/15 text-indigo-400">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-white tracking-tight">
              {summary.overall_completion_rate}%
            </div>
            <div className="text-xs font-medium text-slate-400">Completion Rate</div>
          </div>
        </div>

        {/* Active Streaks */}
        <div className="p-4 rounded-2xl bg-slate-850/70 border border-slate-800 flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-rose-500/15 text-rose-400">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-white tracking-tight">
              {summary.active_streaks_count} / {habits.length}
            </div>
            <div className="text-xs font-medium text-slate-400">Active Streaks</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Contribution Heatmap & Day Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Heatmap Section (2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-850/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">
                Daily Completion Heatmap (Past {timeRangeDays} Days)
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              Click any date to inspect & toggle
            </span>
          </div>

          {/* Heatmap Grid */}
          {loading ? (
            <div className="h-44 flex items-center justify-center text-slate-400 text-sm">
              Loading historical matrix...
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-7 gap-2">
                {historyData?.days.map((day) => {
                  const isSelected = selectedDay?.date === day.date;
                  const intensityClass = getIntensityClass(day.completion_rate, day.completed_count);

                  return (
                    <button
                      key={day.date}
                      type="button"
                      onClick={() => setSelectedDay(day)}
                      title={`${day.date} (${day.dayName}): ${day.completed_count}/${day.total_active} completed (${day.completion_rate}%)`}
                      className={`relative flex flex-col items-center justify-between p-2 rounded-xl border transition-all transform hover:scale-105 cursor-pointer ${intensityClass} ${
                        isSelected
                          ? 'ring-2 ring-indigo-400 shadow-lg scale-105 z-10'
                          : ''
                      } ${day.isToday ? 'border-indigo-400/90' : ''}`}
                    >
                      {/* Day Name */}
                      <span className="text-[10px] font-semibold opacity-75 uppercase">
                        {day.dayName}
                      </span>

                      {/* Day Number */}
                      <span className="text-sm font-bold my-1">
                        {day.dayNumber}
                      </span>

                      {/* Mini completion ratio */}
                      <span className="text-[9px] font-medium opacity-90">
                        {day.completed_count}/{day.total_active}
                      </span>

                      {/* Today marker */}
                      {day.isToday && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-indigo-400 rounded-full ring-2 ring-slate-900" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Heatmap Legend */}
              <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-800 text-xs text-slate-400">
                <span>Less completed</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded bg-slate-800 border border-slate-700" title="0%" />
                  <div className="w-3.5 h-3.5 rounded bg-emerald-950 border border-emerald-800" title="1-34%" />
                  <div className="w-3.5 h-3.5 rounded bg-emerald-800 border border-emerald-600" title="35-69%" />
                  <div className="w-3.5 h-3.5 rounded bg-emerald-600 border border-emerald-500" title="70-99%" />
                  <div className="w-3.5 h-3.5 rounded bg-emerald-500 border border-emerald-400" title="100%" />
                </div>
                <span>100% completed</span>
              </div>
            </div>
          )}
        </div>

        {/* Selected Day Checklist Inspector (1 col) */}
        <div className="p-5 rounded-2xl bg-slate-850/80 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">
                  {selectedDay ? `${selectedDay.dayName}, ${selectedDay.date}` : "Today's Checklist"}
                </h3>
              </div>
              {selectedDay && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  {selectedDay.completion_rate}% Done
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400 mb-3">
              {selectedDay
                ? `Detailed log of habits for this day. Click any habit checkbox to toggle its completion record.`
                : `Select any day in the heatmap to inspect or modify habits completed on that date.`}
            </p>

            {/* Checklist items */}
            {selectedDay ? (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {selectedDay.habits.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleToggleInHistory(item.id, selectedDay.date)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                      item.completed
                        ? 'bg-slate-800/80 border-slate-750 hover:border-slate-650'
                        : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <div className="truncate">
                        <div
                          className={`text-xs font-semibold truncate ${
                            item.completed ? 'text-white' : 'text-slate-400'
                          }`}
                        >
                          {item.title}
                        </div>
                        <div className="text-[10px] text-slate-500">{item.category}</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                        item.completed
                          ? 'bg-emerald-500 text-white shadow-sm'
                          : 'border border-slate-700 text-slate-500 hover:border-slate-500'
                      }`}
                    >
                      {item.completed ? (
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      ) : (
                        <span className="w-2 h-2 rounded-sm" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-44 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-800 rounded-xl">
                <CalendarIcon className="w-8 h-8 text-slate-600 mb-2" />
                <span className="text-xs text-slate-400">
                  Click on any square in the heatmap to view and modify that day's checklist.
                </span>
              </div>
            )}
          </div>

          {selectedDay && (
            <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Completed: {selectedDay.completed_count}</span>
              <span>Pending: {selectedDay.total_active - selectedDay.completed_count}</span>
            </div>
          )}
        </div>
      </div>

      {/* Category Performance Breakdown */}
      {historyData?.categories && historyData.categories.length > 0 && (
        <div className="p-5 rounded-2xl bg-slate-850/80 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Category Completion Consistency (Last 30 Days)</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {historyData.categories.map((cat) => (
              <div
                key={cat.name}
                className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-slate-200">{cat.name}</span>
                  <span className="font-bold text-emerald-400">{cat.completion_rate}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${cat.completion_rate}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-500 mt-1.5">
                  {cat.habit_count} {cat.habit_count === 1 ? 'habit' : 'habits'} tracked
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
