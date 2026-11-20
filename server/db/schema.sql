-- Database Schema for Habit & Daily Goal Tracker

PRAGMA foreign_keys = ON;

-- Habits Table
CREATE TABLE IF NOT EXISTS habits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'General',
    color TEXT NOT NULL DEFAULT '#3B82F6',
    icon TEXT DEFAULT 'target',
    frequency TEXT NOT NULL DEFAULT 'daily',
    target_days_per_week INTEGER DEFAULT 7,
    archived INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

-- Habit Logs Table (Records of daily completions)
CREATE TABLE IF NOT EXISTS habit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    habit_id INTEGER NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    completed_date TEXT NOT NULL, -- Format: YYYY-MM-DD
    completed_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    notes TEXT,
    UNIQUE(habit_id, completed_date)
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_habits_category ON habits(category);
CREATE INDEX IF NOT EXISTS idx_habit_logs_date ON habit_logs(completed_date);
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit ON habit_logs(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_composite ON habit_logs(habit_id, completed_date);
