import db from '../db/database.js';

// Date utility functions using local time to avoid UTC shifting
export function formatDate(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function getTodayDate() {
  return formatDate(new Date());
}

export function getDayOffset(dateStr, offsetDays) {
  const d = parseDate(dateStr);
  d.setDate(d.getDate() + offsetDays);
  return formatDate(d);
}

// Get Monday - Sunday dates for the week containing reference date
export function getMonSunWeekDays(referenceDate = getTodayDate()) {
  const ref = parseDate(referenceDate);
  // getDay(): 0 is Sunday, 1 is Monday ... 6 is Saturday
  const dayOfWeek = ref.getDay();
  // We want Monday as day 0
  const distToMonday = (dayOfWeek + 6) % 7;

  const monday = new Date(ref);
  monday.setDate(monday.getDate() - distToMonday);

  const days = [];
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const todayStr = getTodayDate();

  for (let i = 0; i < 7; i++) {
    const current = new Date(monday);
    current.setDate(current.getDate() + i);
    const dateStr = formatDate(current);

    days.push({
      date: dateStr,
      dayName: dayNames[i],
      dayNumber: current.getDate(),
      isToday: dateStr === todayStr,
      isFuture: dateStr > todayStr
    });
  }

  return days;
}

// Calculate streaks from a Set or array of completed dates (YYYY-MM-DD)
export function calculateStreaks(completedDatesList) {
  if (!completedDatesList || completedDatesList.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const completedSet = new Set(completedDatesList);
  const todayStr = getTodayDate();
  const yesterdayStr = getDayOffset(todayStr, -1);

  // 1. Calculate Current Streak
  let currentStreak = 0;
  let checkDate = null;

  if (completedSet.has(todayStr)) {
    // Completed today -> streak continues from today
    checkDate = todayStr;
  } else if (completedSet.has(yesterdayStr)) {
    // Not completed today yet, but completed yesterday -> streak is still alive!
    checkDate = yesterdayStr;
  }

  if (checkDate) {
    while (completedSet.has(checkDate)) {
      currentStreak++;
      checkDate = getDayOffset(checkDate, -1);
    }
  }

  // 2. Calculate Longest Streak
  // Sort unique dates ascending
  const sortedDates = Array.from(completedSet).sort();
  let longestStreak = 0;
  let streakCounter = 0;
  let prevDate = null;

  for (const d of sortedDates) {
    if (!prevDate) {
      streakCounter = 1;
    } else {
      const expectedNext = getDayOffset(prevDate, 1);
      if (d === expectedNext) {
        streakCounter++;
      } else {
        streakCounter = 1;
      }
    }
    if (streakCounter > longestStreak) {
      longestStreak = streakCounter;
    }
    prevDate = d;
  }

  return { currentStreak, longestStreak };
}

// Format habit row with dynamic metrics (streaks, weekly progress, etc.)
export function enrichHabit(habitRow, logsMap = null, weekTemplate = null) {
  const todayStr = getTodayDate();
  const weekDays = weekTemplate || getMonSunWeekDays(todayStr);

  let logs = [];
  if (logsMap && logsMap.has(habitRow.id)) {
    logs = logsMap.get(habitRow.id);
  } else {
    // Fetch logs if not provided in batch
    const rows = db.prepare(`
      SELECT completed_date 
      FROM habit_logs 
      WHERE habit_id = ? 
      ORDER BY completed_date DESC
    `).all(habitRow.id);
    logs = rows.map(r => r.completed_date);
  }

  const logSet = new Set(logs);
  const { currentStreak, longestStreak } = calculateStreaks(logs);

  // Mon - Sun weekly indicators
  const weeklyProgress = weekDays.map(day => ({
    date: day.date,
    dayName: day.dayName,
    dayNumber: day.dayNumber,
    isToday: day.isToday,
    isFuture: day.isFuture,
    completed: logSet.has(day.date)
  }));

  // Past 30 days completion rate
  let completedPast30 = 0;
  for (let i = 0; i < 30; i++) {
    const dStr = getDayOffset(todayStr, -i);
    if (logSet.has(dStr)) {
      completedPast30++;
    }
  }
  const completionRate30d = Math.round((completedPast30 / 30) * 100);

  return {
    id: habitRow.id,
    title: habitRow.title,
    description: habitRow.description || '',
    category: habitRow.category,
    color: habitRow.color,
    icon: habitRow.icon,
    frequency: habitRow.frequency,
    target_days_per_week: habitRow.target_days_per_week,
    created_at: habitRow.created_at,
    updated_at: habitRow.updated_at,
    completed_today: logSet.has(todayStr),
    current_streak: currentStreak,
    longest_streak: longestStreak,
    total_completions: logs.length,
    completion_rate_30d: completionRate30d,
    weekly_progress: weeklyProgress,
    recent_logs: logs.slice(0, 30)
  };
}

export const HabitService = {
  // GET all habits with calculated streak data
  getAllHabits() {
    const habits = db.prepare(`
      SELECT * FROM habits 
      WHERE archived = 0 
      ORDER BY id ASC
    `).all();

    // Fetch all logs in one query for performance
    const allLogs = db.prepare(`
      SELECT habit_id, completed_date 
      FROM habit_logs 
      ORDER BY completed_date DESC
    `).all();

    const logsMap = new Map();
    for (const log of allLogs) {
      if (!logsMap.has(log.habit_id)) {
        logsMap.set(log.habit_id, []);
      }
      logsMap.get(log.habit_id).push(log.completed_date);
    }

    const weekTemplate = getMonSunWeekDays();
    return habits.map(habit => enrichHabit(habit, logsMap, weekTemplate));
  },

  // GET single habit
  getHabitById(id) {
    const habit = db.prepare(`SELECT * FROM habits WHERE id = ?`).get(id);
    if (!habit) return null;
    return enrichHabit(habit);
  },

  // CREATE habit
  createHabit(data) {
    const {
      title,
      description = '',
      category = 'General',
      color = '#3B82F6',
      icon = 'target',
      frequency = 'daily',
      target_days_per_week = 7
    } = data;

    const stmt = db.prepare(`
      INSERT INTO habits (title, description, category, color, icon, frequency, target_days_per_week)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      title.trim(),
      description.trim(),
      category.trim(),
      color.trim(),
      icon.trim(),
      frequency.trim(),
      Number(target_days_per_week) || 7
    );

    return this.getHabitById(result.lastInsertRowid);
  },

  // UPDATE habit
  updateHabit(id, data) {
    const existing = db.prepare(`SELECT * FROM habits WHERE id = ?`).get(id);
    if (!existing) return null;

    const title = data.title !== undefined ? data.title.trim() : existing.title;
    const description = data.description !== undefined ? data.description.trim() : existing.description;
    const category = data.category !== undefined ? data.category.trim() : existing.category;
    const color = data.color !== undefined ? data.color.trim() : existing.color;
    const icon = data.icon !== undefined ? data.icon.trim() : existing.icon;
    const frequency = data.frequency !== undefined ? data.frequency.trim() : existing.frequency;
    const target_days_per_week = data.target_days_per_week !== undefined
      ? Number(data.target_days_per_week)
      : existing.target_days_per_week;

    const stmt = db.prepare(`
      UPDATE habits 
      SET title = ?, description = ?, category = ?, color = ?, icon = ?, frequency = ?, target_days_per_week = ?, updated_at = datetime('now', 'localtime')
      WHERE id = ?
    `);

    stmt.run(title, description, category, color, icon, frequency, target_days_per_week, id);
    return this.getHabitById(id);
  },

  // DELETE habit
  deleteHabit(id) {
    const existing = db.prepare(`SELECT * FROM habits WHERE id = ?`).get(id);
    if (!existing) return false;

    // Delete associated logs and habit in transaction
    const deleteTx = db.transaction(() => {
      db.prepare(`DELETE FROM habit_logs WHERE habit_id = ?`).run(id);
      db.prepare(`DELETE FROM habits WHERE id = ?`).run(id);
    });

    deleteTx();
    return true;
  },

  // TOGGLE habit completion for a specific date (defaults to today)
  toggleHabit(id, targetDate = getTodayDate(), notes = '') {
    const habit = db.prepare(`SELECT * FROM habits WHERE id = ?`).get(id);
    if (!habit) return null;

    // Validate targetDate format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) {
      throw new Error('Invalid date format. Expected YYYY-MM-DD');
    }

    const existingLog = db.prepare(`
      SELECT id FROM habit_logs 
      WHERE habit_id = ? AND completed_date = ?
    `).get(id, targetDate);

    let completedNow = false;

    if (existingLog) {
      // Toggle OFF -> Delete log
      db.prepare(`DELETE FROM habit_logs WHERE id = ?`).run(existingLog.id);
      completedNow = false;
    } else {
      // Toggle ON -> Insert log
      db.prepare(`
        INSERT INTO habit_logs (habit_id, completed_date, notes)
        VALUES (?, ?, ?)
      `).run(id, targetDate, notes);
      completedNow = true;
    }

    // Return the fresh enriched habit
    const updatedHabit = this.getHabitById(id);
    return {
      habit: updatedHabit,
      toggled_date: targetDate,
      completed: completedNow
    };
  },

  // GET historical data for trends, heatmap, and calendar views
  getHistoricalData(habitId = null, daysCount = 35) {
    const todayStr = getTodayDate();
    const daysLimit = Math.max(7, Math.min(daysCount, 90));

    // Base habits
    let habitsQuery = `SELECT * FROM habits WHERE archived = 0`;
    const params = [];
    if (habitId) {
      habitsQuery += ` AND id = ?`;
      params.push(habitId);
    }
    const habits = db.prepare(habitsQuery).all(...params);

    if (habits.length === 0) {
      return {
        summary: {
          total_habits: 0,
          total_checkins: 0,
          best_streak: 0,
          overall_completion_rate: 0,
          active_streaks_count: 0
        },
        days: [],
        categories: []
      };
    }

    // Generate date sequence from (today - daysLimit + 1) to today
    const dateList = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = daysLimit - 1; i >= 0; i--) {
      const dStr = getDayOffset(todayStr, -i);
      const d = parseDate(dStr);
      dateList.push({
        date: dStr,
        dayName: dayNames[d.getDay()],
        dayNumber: d.getDate(),
        month: d.toLocaleString('en-US', { month: 'short' }),
        year: d.getFullYear(),
        isToday: dStr === todayStr
      });
    }

    const startDate = dateList[0].date;
    const endDate = dateList[dateList.length - 1].date;

    // Fetch logs within this date range
    let logsQuery = `
      SELECT hl.habit_id, hl.completed_date, h.title, h.color, h.category
      FROM habit_logs hl
      JOIN habits h ON hl.habit_id = h.id
      WHERE hl.completed_date >= ? AND hl.completed_date <= ?
    `;
    const logsParams = [startDate, endDate];
    if (habitId) {
      logsQuery += ` AND hl.habit_id = ?`;
      logsParams.push(habitId);
    }

    const logs = db.prepare(logsQuery).all(...logsParams);

    // Map logs by date -> habit_id set
    const dateLogsMap = new Map();
    for (const log of logs) {
      if (!dateLogsMap.has(log.completed_date)) {
        dateLogsMap.set(log.completed_date, []);
      }
      dateLogsMap.get(log.completed_date).push(log);
    }

    // Build day-by-day trend data
    let totalPossibleCheckins = 0;
    let actualTotalCheckins = 0;

    const days = dateList.map(item => {
      const logsOnDay = dateLogsMap.get(item.date) || [];
      const completedHabitIds = new Set(logsOnDay.map(l => l.habit_id));

      const habitStatuses = habits.map(h => ({
        id: h.id,
        title: h.title,
        category: h.category,
        color: h.color,
        completed: completedHabitIds.has(h.id)
      }));

      const completedCount = logsOnDay.length;
      const totalActive = habits.length;
      const rate = totalActive > 0 ? Math.round((completedCount / totalActive) * 100) : 0;

      totalPossibleCheckins += totalActive;
      actualTotalCheckins += completedCount;

      return {
        ...item,
        total_active: totalActive,
        completed_count: completedCount,
        completion_rate: rate,
        habits: habitStatuses
      };
    });

    // Summary calculations across all habits
    const enrichedAll = habits.map(h => this.getHabitById(h.id));
    const bestStreak = enrichedAll.reduce((max, h) => Math.max(max, h.longest_streak), 0);
    const activeStreaksCount = enrichedAll.filter(h => h.current_streak > 0).length;
    const allTimeLogsCount = db.prepare(`SELECT COUNT(*) as count FROM habit_logs`).get().count;

    const overallRate = totalPossibleCheckins > 0
      ? Math.round((actualTotalCheckins / totalPossibleCheckins) * 100)
      : 0;

    // Category breakdown
    const categoryMap = new Map();
    for (const h of enrichedAll) {
      if (!categoryMap.has(h.category)) {
        categoryMap.set(h.category, { total: 0, completedSum: 0, habitCount: 0 });
      }
      const cat = categoryMap.get(h.category);
      cat.habitCount++;
      cat.total += 30; // 30 day window
      // count completions in last 30
      cat.completedSum += h.recent_logs.length;
    }

    const categories = Array.from(categoryMap.entries()).map(([name, stats]) => ({
      name,
      habit_count: stats.habitCount,
      completion_rate: Math.min(100, Math.round((stats.completedSum / (stats.habitCount * 30)) * 100))
    }));

    return {
      summary: {
        total_habits: habits.length,
        total_checkins: allTimeLogsCount,
        period_checkins: actualTotalCheckins,
        best_streak: bestStreak,
        overall_completion_rate: overallRate,
        active_streaks_count: activeStreaksCount,
        completed_today_count: dateLogsMap.get(todayStr)?.length || 0
      },
      days,
      categories
    };
  }
};
