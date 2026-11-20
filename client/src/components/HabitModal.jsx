import React, { useState, useEffect } from 'react';
import {
  X,
  Target,
  Flame,
  Brain,
  Zap,
  BookOpen,
  Droplets,
  Heart,
  Briefcase,
  Activity,
  Check
} from 'lucide-react';

const PRESET_CATEGORIES = [
  'Mindfulness',
  'Health & Fitness',
  'Productivity',
  'Learning',
  'Finance',
  'Lifestyle'
];

const PRESET_COLORS = [
  '#10B981', // Emerald
  '#6366F1', // Indigo
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#8B5CF6', // Violet
  '#F43F5E', // Rose
  '#14B8A6'  // Teal
];

const PRESET_ICONS = [
  { name: 'target', label: 'Target', Icon: Target },
  { name: 'flame', label: 'Flame', Icon: Flame },
  { name: 'brain', label: 'Brain', Icon: Brain },
  { name: 'zap', label: 'Zap', Icon: Zap },
  { name: 'book-open', label: 'Reading', Icon: BookOpen },
  { name: 'droplets', label: 'Water', Icon: Droplets },
  { name: 'heart', label: 'Health', Icon: Heart },
  { name: 'briefcase', label: 'Work', Icon: Briefcase }
];

export default function HabitModal({
  isOpen,
  onClose,
  onSubmit,
  habit = null // If provided, edit mode; otherwise, create mode
}) {
  const isEditMode = Boolean(habit);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Mindfulness');
  const [customCategory, setCustomCategory] = useState('');
  const [color, setColor] = useState('#10B981');
  const [icon, setIcon] = useState('target');
  const [targetDays, setTargetDays] = useState(7);
  const [frequency, setFrequency] = useState('daily');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state when editing a habit
  useEffect(() => {
    if (habit) {
      setTitle(habit.title || '');
      setDescription(habit.description || '');
      if (PRESET_CATEGORIES.includes(habit.category)) {
        setCategory(habit.category);
        setCustomCategory('');
      } else {
        setCategory('Custom');
        setCustomCategory(habit.category || '');
      }
      setColor(habit.color || '#10B981');
      setIcon(habit.icon || 'target');
      setTargetDays(habit.target_days_per_week || 7);
      setFrequency(habit.frequency || 'daily');
    } else {
      // Default reset
      setTitle('');
      setDescription('');
      setCategory('Mindfulness');
      setCustomCategory('');
      setColor('#10B981');
      setIcon('target');
      setTargetDays(7);
      setFrequency('daily');
    }
    setError('');
  }, [habit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Please provide a habit title');
      return;
    }

    const finalCategory = category === 'Custom' ? (customCategory.trim() || 'General') : category;

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        category: finalCategory,
        color,
        icon,
        frequency,
        target_days_per_week: Number(targetDays)
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save habit');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-slate-900 border border-slate-750 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-850/50">
          <div className="flex items-center gap-3">
            <div
              className="w-3.5 h-3.5 rounded-full"
              style={{ backgroundColor: color }}
            />
            <h2 className="text-lg font-bold text-white">
              {isEditMode ? 'Edit Habit' : 'Create New Habit'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 text-xs text-rose-300 bg-rose-500/15 border border-rose-500/30 rounded-xl">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Habit Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={100}
              placeholder="e.g. Read 20 Pages, Morning Run, Meditation"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Goal or Motivation (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Why does this habit matter to you?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-500 resize-none"
            />
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Category
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {PRESET_CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    category === cat
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-750'
                  }`}
                >
                  {cat}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setCategory('Custom')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  category === 'Custom'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-750'
                }`}
              >
                + Custom
              </button>
            </div>

            {category === 'Custom' && (
              <input
                type="text"
                placeholder="Enter custom category name"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="w-full mt-2 px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            )}
          </div>

          {/* Color Palette Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Color Tag
            </label>
            <div className="flex items-center gap-3">
              {PRESET_COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 relative"
                  style={{ backgroundColor: c }}
                >
                  {color.toLowerCase() === c.toLowerCase() && (
                    <Check className="w-4 h-4 text-white stroke-[3]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Icon Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Habit Icon
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {PRESETICONS_SELECTOR(icon, setIcon)}
            </div>
          </div>

          {/* Target Days Per Week */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Weekly Target: {targetDays} {targetDays === 1 ? 'day' : 'days'}
              </label>
              <span className="text-xs text-indigo-400 font-medium">
                {targetDays === 7 ? 'Every Single Day' : `${targetDays}x per week`}
              </span>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                <button
                  type="button"
                  key={num}
                  onClick={() => setTargetDays(num)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    targetDays === num
                      ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-750'
                  }`}
                >
                  {num}d
                </button>
              ))}
            </div>
          </div>

          {/* Modal Footer Buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Saving...</span>
              ) : (
                <span>{isEditMode ? 'Update Habit' : 'Create Habit'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PRESETICONS_SELECTOR(selectedIcon, onSelect) {
  return PRESET_ICONS.map(({ name, label, Icon }) => {
    const isSelected = selectedIcon === name;
    return (
      <button
        type="button"
        key={name}
        onClick={() => onSelect(name)}
        title={label}
        className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${
          isSelected
            ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-400/50'
            : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-750'
        }`}
      >
        <Icon className="w-5 h-5" />
      </button>
    );
  });
}
