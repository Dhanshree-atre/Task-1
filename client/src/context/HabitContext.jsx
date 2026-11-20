import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { habitsApi } from '../api/habitsApi';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

const HabitContext = createContext(null);

export function HabitProvider({ children }) {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);

  // Confetti celebration helper
  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // Ignore if canvas is unavailable
    }
  };

  // Fetch all habits from server
  const fetchHabits = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await habitsApi.getHabits();
      setHabits(res.data || []);
      setIsOnline(true);
    } catch (err) {
      console.error('Failed to fetch habits:', err);
      setIsOnline(false);
      if (!silent) {
        toast.error('Unable to connect to Habit Tracker server. Ensure backend is running.', {
          id: 'server-connection-error',
          duration: 5000
        });
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  // Periodic silent polling to keep state in sync if multiple tabs are open
  useEffect(() => {
    fetchHabits();
    const interval = setInterval(() => {
      fetchHabits(true);
    }, 15000);
    return () => clearInterval(interval);
  }, [fetchHabits]);

  // CREATE Habit
  const createHabit = async (habitData) => {
    try {
      const res = await habitsApi.createHabit(habitData);
      const newHabit = res.data;
      setHabits((prev) => [...prev, newHabit]);
      toast.success(`Created "${newHabit.title}"! 🎯`);
      return newHabit;
    } catch (err) {
      toast.error(err.message || 'Failed to create habit');
      throw err;
    }
  };

  // UPDATE Habit
  const updateHabit = async (id, habitData) => {
    try {
      const res = await habitsApi.updateHabit(id, habitData);
      const updated = res.data;
      setHabits((prev) => prev.map((h) => (h.id === id ? updated : h)));
      toast.success(`Updated "${updated.title}"`);
      return updated;
    } catch (err) {
      toast.error(err.message || 'Failed to update habit');
      throw err;
    }
  };

  // DELETE Habit (with optimistic removal and rollback)
  const deleteHabit = async (id) => {
    const previousHabits = [...habits];
    const habitToDelete = habits.find((h) => h.id === id);

    // Optimistic removal
    setHabits((prev) => prev.filter((h) => h.id !== id));

    try {
      await habitsApi.deleteHabit(id);
      toast.success(`Deleted "${habitToDelete?.title || 'Habit'}"`);
    } catch (err) {
      // Rollback on failure
      setHabits(previousHabits);
      toast.error(`Failed to delete habit: ${err.message || 'Server error'}. Restored.`);
      throw err;
    }
  };

  // TOGGLE Habit Completion (Full Optimistic UI with rollback on error)
  const toggleHabit = async (id, targetDate = null, notes = '') => {
    const previousHabits = [...habits];
    const targetHabit = habits.find((h) => h.id === id);
    if (!targetHabit) return;

    // Check if toggling today or a past date
    const todayStr = new Date().toISOString().slice(0, 10);
    const dateToToggle = targetDate || todayStr;
    const isToday = dateToToggle === todayStr;

    // 1. Apply Optimistic Update to UI
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== id) return h;

        const nextCompletedState = isToday ? !h.completed_today : true;
        const newStreak = nextCompletedState
          ? h.current_streak + 1
          : Math.max(0, h.current_streak - 1);

        const updatedWeekly = h.weekly_progress.map((d) => {
          if (d.date === dateToToggle) {
            return { ...d, completed: !d.completed };
          }
          return d;
        });

        return {
          ...h,
          completed_today: isToday ? nextCompletedState : h.completed_today,
          current_streak: isToday ? newStreak : h.current_streak,
          longest_streak: Math.max(h.longest_streak, newStreak),
          weekly_progress: updatedWeekly
        };
      })
    );

    // 2. Perform backend sync
    try {
      const res = await habitsApi.toggleHabit(id, dateToToggle, notes);
      const authoritativeHabit = res.data.habit;
      const completed = res.data.completed;

      // Update with exact backend calculation
      setHabits((prev) => prev.map((h) => (h.id === id ? authoritativeHabit : h)));

      if (completed) {
        toast.success(
          `Checked in! 🔥 Streak: ${authoritativeHabit.current_streak} ${
            authoritativeHabit.current_streak === 1 ? 'day' : 'days'
          }`,
          { id: `checkin-${id}` }
        );

        // Check if all habits are now completed today
        const willAllBeCompleted = habits.every((h) =>
          h.id === id ? true : h.completed_today
        );
        if (willAllBeCompleted) {
          triggerCelebration();
          toast('🎉 All daily habits completed for today! Outstanding work!', {
            icon: '🌟',
            duration: 4000
          });
        }
      } else {
        toast(`Unchecked "${targetHabit.title}" for ${dateToToggle}`, {
          icon: '↩️',
          id: `uncheck-${id}`
        });
      }
    } catch (err) {
      // 3. Rollback Optimistic Change on Network or Server Error
      console.error('Toggle habit failed, reverting UI:', err);
      setHabits(previousHabits);
      toast.error(
        `Failed to sync check-in with server (${err.message || 'Network error'}). Changes reverted.`,
        { duration: 4000 }
      );
    }
  };

  const value = {
    habits,
    loading,
    isOnline,
    fetchHabits,
    createHabit,
    updateHabit,
    deleteHabit,
    toggleHabit
  };

  return <HabitContext.Provider value={value}>{children}</HabitContext.Provider>;
}

export function useHabits() {
  const context = useContext(HabitContext);
  if (!context) {
    throw new Error('useHabits must be used within a HabitProvider');
  }
  return context;
}
