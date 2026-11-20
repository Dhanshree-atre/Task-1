import React, { useState, useMemo } from 'react';
import { Toaster } from 'react-hot-toast';
import { HabitProvider, useHabits } from './context/HabitContext';
import Navbar from './components/Navbar';
import StatsHeader from './components/StatsHeader';
import CategoryFilter from './components/CategoryFilter';
import HabitCard from './components/HabitCard';
import HabitModal from './components/HabitModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import HistoricalView from './components/HistoricalView';
import EmptyState from './components/EmptyState';
import { Sparkles, Database, ShieldCheck, Heart } from 'lucide-react';

function HabitAppContent() {
  const {
    habits,
    loading,
    isOnline,
    createHabit,
    updateHabit,
    deleteHabit,
    toggleHabit
  } = useHabits();

  // Navigation tab
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'history'

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [deletingHabit, setDeletingHabit] = useState(null);

  // Filters & Search
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'completed'
  const [sortBy, setSortBy] = useState('streak'); // 'streak' | 'title' | 'created'

  // Extract unique categories from current habits
  const categories = useMemo(() => {
    const set = new Set();
    habits.forEach((h) => {
      if (h.category) set.add(h.category);
    });
    return Array.from(set);
  }, [habits]);

  // Filtered and Sorted habits
  const filteredHabits = useMemo(() => {
    return habits
      .filter((h) => {
        // Category filter
        if (selectedCategory !== 'all' && h.category !== selectedCategory) {
          return false;
        }
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = h.title.toLowerCase().includes(q);
          const matchDesc = (h.description || '').toLowerCase().includes(q);
          if (!matchTitle && !matchDesc) return false;
        }
        // Status filter
        if (statusFilter === 'pending' && h.completed_today) return false;
        if (statusFilter === 'completed' && !h.completed_today) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'streak') {
          return (b.current_streak || 0) - (a.current_streak || 0);
        }
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        if (sortBy === 'created') {
          return (b.id || 0) - (a.id || 0);
        }
        return 0;
      });
  }, [habits, selectedCategory, searchQuery, statusFilter, sortBy]);

  // Modal handlers
  const handleOpenCreateModal = () => {
    setEditingHabit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (habit) => {
    setEditingHabit(habit);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (formData) => {
    if (editingHabit) {
      await updateHabit(editingHabit.id, formData);
    } else {
      await createHabit(formData);
    }
  };

  const isFiltered = selectedCategory !== 'all' || searchQuery.trim() !== '' || statusFilter !== 'all';

  const resetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setStatusFilter('all');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Toast Notification Container */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#1E293B',
            color: '#F8FAFC',
            border: '1px solid #334155',
            borderRadius: '0.75rem',
            fontSize: '0.8125rem',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#FFFFFF'
            }
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#FFFFFF'
            }
          }
        }}
      />

      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCreateModal={handleOpenCreateModal}
        isOnline={isOnline}
        habitsCount={habits.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          // Loading Skeleton
          <div className="space-y-6 animate-pulse">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-slate-800/60 rounded-2xl border border-slate-750" />
              ))}
            </div>
            <div className="h-10 bg-slate-800/40 rounded-xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 bg-slate-800/50 rounded-2xl border border-slate-750" />
              ))}
            </div>
          </div>
        ) : activeTab === 'dashboard' ? (
          // Dashboard View
          <div>
            {/* Header KPI cards */}
            <StatsHeader habits={habits} />

            {/* Filters, Search & Sorting Bar */}
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />

            {/* Habit Cards Grid or Empty State */}
            {filteredHabits.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredHabits.map((habit) => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    onToggleToday={(id) => toggleHabit(id)}
                    onToggleDay={(id, date) => toggleHabit(id, date)}
                    onEdit={handleOpenEditModal}
                    onDelete={setDeletingHabit}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                isFiltered={isFiltered}
                onResetFilters={resetFilters}
                onOpenCreate={handleOpenCreateModal}
              />
            )}
          </div>
        ) : (
          // Historical Trends View
          <HistoricalView
            habits={habits}
            onToggleHabitDate={(habitId, date) => toggleHabit(habitId, date)}
          />
        )}
      </main>

      {/* Create / Edit Habit Modal */}
      <HabitModal
        isOpen={isModalOpen}
        habit={editingHabit}
        onClose={() => {
          setIsModalOpen(false);
          setEditingHabit(null);
        }}
        onSubmit={handleModalSubmit}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingHabit)}
        habit={deletingHabit}
        onClose={() => setDeletingHabit(null)}
        onConfirm={deleteHabit}
      />

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 bg-slate-900/50 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">HabitFlow</span>
            <span>• Full-Stack Habit & Daily Goal Tracker</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              <span>SQLite + WAL Engine</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Optimistic Real-Time Sync</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <HabitProvider>
      <HabitAppContent />
    </HabitProvider>
  );
}
