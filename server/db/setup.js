import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function setupDatabase() {
  console.log('🔄 Initializing database schema...');
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  // Execute schema creation
  db.exec(schemaSql);
  console.log('✅ Database schema initialized successfully.');

  // Check if habits table has records
  const countRow = db.prepare('SELECT COUNT(*) as count FROM habits').get();
  const shouldReset = process.argv.includes('--reset') || process.argv.includes('-r');

  if (countRow.count > 0 && !shouldReset) {
    console.log(`ℹ️ Database already contains ${countRow.count} habits. Skipping seed.`);
    return;
  }

  if (shouldReset && countRow.count > 0) {
    console.log('🧹 Resetting existing tables...');
    db.prepare('DELETE FROM habit_logs').run();
    db.prepare('DELETE FROM habits').run();
    console.log('✅ Existing data wiped.');
  }

  console.log('🌱 Seeding sample habits and historical logs...');

  const sampleHabits = [
    {
      title: 'Morning Meditation (15m)',
      description: 'Mindful breathing and morning clarity session',
      category: 'Mindfulness',
      color: '#10B981', // Emerald
      icon: 'brain',
      frequency: 'daily',
      target_days_per_week: 7,
      streakLength: 12,
      completionProbability: 0.85
    },
    {
      title: 'Daily 5km Run / Cardio',
      description: 'Outdoor jog or treadmill cardio to build stamina',
      category: 'Health & Fitness',
      color: '#F59E0B', // Amber
      icon: 'flame',
      frequency: 'daily',
      target_days_per_week: 5,
      streakLength: 5,
      completionProbability: 0.70
    },
    {
      title: 'Deep Work Session (90m)',
      description: 'Zero distractions, no notifications, pure creative flow',
      category: 'Productivity',
      color: '#6366F1', // Indigo
      icon: 'zap',
      frequency: 'daily',
      target_days_per_week: 6,
      streakLength: 8,
      completionProbability: 0.80
    },
    {
      title: 'Read Non-Fiction (20 Pages)',
      description: 'Daily reading habit for continuous self-learning',
      category: 'Learning',
      color: '#EC4899', // Pink
      icon: 'book-open',
      frequency: 'daily',
      target_days_per_week: 7,
      streakLength: 18,
      completionProbability: 0.90
    },
    {
      title: 'Hydrate 2.5L Water',
      description: 'Drink full bottle in morning, afternoon, and evening',
      category: 'Health & Fitness',
      color: '#06B6D4', // Cyan
      icon: 'droplets',
      frequency: 'daily',
      target_days_per_week: 7,
      streakLength: 15,
      completionProbability: 0.92
    },
    {
      title: 'Evening Gratitude & Planning',
      description: 'Journal 3 things I am grateful for and plan top 3 priorities for tomorrow',
      category: 'Mindfulness',
      color: '#8B5CF6', // Violet
      icon: 'pen-tool',
      frequency: 'daily',
      target_days_per_week: 7,
      streakLength: 3,
      completionProbability: 0.75
    }
  ];

  const insertHabitStmt = db.prepare(`
    INSERT INTO habits (title, description, category, color, icon, frequency, target_days_per_week)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertLogStmt = db.prepare(`
    INSERT OR IGNORE INTO habit_logs (habit_id, completed_date, notes)
    VALUES (?, ?, ?)
  `);

  const now = new Date();

  // Helper to format Date as YYYY-MM-DD local string
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const seedTransaction = db.transaction(() => {
    for (const habit of sampleHabits) {
      const result = insertHabitStmt.run(
        habit.title,
        habit.description,
        habit.category,
        habit.color,
        habit.icon,
        habit.frequency,
        habit.target_days_per_week
      );
      const habitId = result.lastInsertRowid;

      // Seed past 35 days of history
      for (let i = 35; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = formatDate(d);

        let completed = false;

        // Guarantee an active streak for recent days based on habit.streakLength
        if (i < habit.streakLength) {
          completed = true;
        } else {
          // Semi-random past completions to simulate natural history
          const seedValue = (habitId * 17 + i * 23) % 100;
          completed = seedValue < (habit.completionProbability * 100);
        }

        // Keep one or two habits unchecked today so user can check them immediately in demo
        if (i === 0 && (habit.title.includes('Evening') || habit.title.includes('Run'))) {
          completed = false;
        }

        if (completed) {
          insertLogStmt.run(habitId, dateStr, 'Auto-generated seed check-in');
        }
      }
    }
  });

  seedTransaction();

  const totalHabits = db.prepare('SELECT COUNT(*) as count FROM habits').get().count;
  const totalLogs = db.prepare('SELECT COUNT(*) as count FROM habit_logs').get().count;

  console.log(`🎉 Database seeded successfully!`);
  console.log(`📊 Habits created: ${totalHabits}`);
  console.log(`📝 Completion logs created: ${totalLogs}`);
}

// Allow direct execution: node setup.js [--reset]
if (process.argv[1] && process.argv[1].endsWith('setup.js')) {
  setupDatabase();
}
