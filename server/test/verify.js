import assert from 'assert';
import { setupDatabase } from '../db/setup.js';
import db from '../db/database.js';
import { HabitService, getTodayDate, getDayOffset } from '../services/habitService.js';

console.log('🧪 Starting Full-Stack Habit Tracker Verification Test Suite...\n');

async function runTests() {
  // Test 1: Database Setup and Seeding
  console.log('1️⃣ Testing Database Setup & Seeding...');
  setupDatabase();

  const habitCount = db.prepare('SELECT COUNT(*) as count FROM habits').get().count;
  const logCount = db.prepare('SELECT COUNT(*) as count FROM habit_logs').get().count;

  assert.ok(habitCount >= 6, `Expected at least 6 habits, got ${habitCount}`);
  assert.ok(logCount >= 100, `Expected at least 100 logs, got ${logCount}`);
  console.log(`   ✅ DB verified: ${habitCount} habits, ${logCount} completion logs.\n`);

  // Test 2: Habit Listing & Streak Calculations
  console.log('2️⃣ Testing Habit Listing & Streak Logic...');
  const habits = HabitService.getAllHabits();
  assert.strictEqual(habits.length, habitCount);

  const firstHabit = habits[0];
  assert.ok(firstHabit.id);
  assert.ok(firstHabit.title);
  assert.ok(Array.isArray(firstHabit.weekly_progress));
  assert.strictEqual(firstHabit.weekly_progress.length, 7, 'Weekly progress must contain 7 days (Mon-Sun)');
  assert.ok(typeof firstHabit.current_streak === 'number');
  assert.ok(typeof firstHabit.longest_streak === 'number');
  assert.ok(firstHabit.longest_streak >= firstHabit.current_streak, 'Longest streak must be >= current streak');
  console.log(`   ✅ Habit: "${firstHabit.title}" has current streak: ${firstHabit.current_streak}d, record: ${firstHabit.longest_streak}d.`);
  console.log(`   ✅ Weekly progress days: ${firstHabit.weekly_progress.map(d => `${d.dayName}:${d.completed ? '✓' : '-'}`).join(' ')}\n`);

  // Test 3: Habit Creation
  console.log('3️⃣ Testing Habit Creation (POST)...');
  const created = HabitService.createHabit({
    title: 'Verify Unit Tests',
    description: 'Ensure automated test coverage',
    category: 'Productivity',
    color: '#6366F1',
    icon: 'zap',
    frequency: 'daily',
    target_days_per_week: 7
  });

  assert.ok(created.id);
  assert.strictEqual(created.title, 'Verify Unit Tests');
  assert.strictEqual(created.current_streak, 0);
  assert.strictEqual(created.completed_today, false);
  console.log(`   ✅ Created habit ID ${created.id}: "${created.title}"\n`);

  // Test 4: Habit Toggle (Optimistic Check-in & Streak Increment)
  console.log('4️⃣ Testing Habit Check-in / Toggle (POST /:id/toggle)...');
  const todayStr = getTodayDate();
  const toggleResult = HabitService.toggleHabit(created.id, todayStr);

  assert.strictEqual(toggleResult.completed, true, 'Habit should be marked completed');
  assert.strictEqual(toggleResult.habit.completed_today, true);
  assert.strictEqual(toggleResult.habit.current_streak, 1, 'Current streak should increment to 1');
  console.log(`   ✅ Check-in today succeeded. New streak: ${toggleResult.habit.current_streak}`);

  // Test multi-day streak calculation
  const yesterdayStr = getDayOffset(todayStr, -1);
  HabitService.toggleHabit(created.id, yesterdayStr);
  const twoDaysStreakHabit = HabitService.getHabitById(created.id);
  assert.strictEqual(twoDaysStreakHabit.current_streak, 2, 'Consecutive yesterday + today should yield 2-day streak');
  console.log(`   ✅ Added yesterday check-in. Consecutive streak verified: ${twoDaysStreakHabit.current_streak} days.`);

  // Toggle off today
  const uncheckResult = HabitService.toggleHabit(created.id, todayStr);
  assert.strictEqual(uncheckResult.completed, false, 'Habit should be unmarked');
  const afterUncheck = HabitService.getHabitById(created.id);
  // Yesterday is still completed, so streak is still 1
  assert.strictEqual(afterUncheck.current_streak, 1);
  console.log(`   ✅ Uncheck toggle succeeded. Active streak maintained from yesterday: ${afterUncheck.current_streak}\n`);

  // Test 5: Habit Update
  console.log('5️⃣ Testing Habit Update (PUT /:id)...');
  const updated = HabitService.updateHabit(created.id, {
    title: 'Verify Unit Tests (Updated)',
    color: '#10B981',
    target_days_per_week: 5
  });

  assert.strictEqual(updated.title, 'Verify Unit Tests (Updated)');
  assert.strictEqual(updated.color, '#10B981');
  assert.strictEqual(updated.target_days_per_week, 5);
  console.log(`   ✅ Updated habit ID ${created.id}: "${updated.title}", color: ${updated.color}\n`);

  // Test 6: Historical Data Query (GET /api/habits/history)
  console.log('6️⃣ Testing Historical Trends Query (GET /api/habits/history)...');
  const history = HabitService.getHistoricalData(null, 35);
  assert.ok(history.summary);
  assert.ok(history.summary.total_checkins > 0);
  assert.ok(history.summary.best_streak > 0);
  assert.ok(Array.isArray(history.days));
  assert.strictEqual(history.days.length, 35, 'Expected 35 days in historical matrix');
  assert.ok(Array.isArray(history.categories));
  console.log(`   ✅ Historical summary verified: ${history.summary.total_checkins} total check-ins, ${history.summary.overall_completion_rate}% rate.`);
  console.log(`   ✅ Heatmap days: ${history.days.length} days returned, category stats: ${history.categories.length} categories.\n`);

  // Test 7: Habit Deletion
  console.log('7️⃣ Testing Habit Deletion (DELETE /:id)...');
  const deleted = HabitService.deleteHabit(created.id);
  assert.strictEqual(deleted, true);
  const findDeleted = HabitService.getHabitById(created.id);
  assert.strictEqual(findDeleted, null, 'Deleted habit must no longer exist');
  const checkLogsDeleted = db.prepare('SELECT COUNT(*) as count FROM habit_logs WHERE habit_id = ?').get(created.id).count;
  assert.strictEqual(checkLogsDeleted, 0, 'Associated habit logs must be cascaded/deleted');
  console.log(`   ✅ Habit ID ${created.id} and cascaded logs deleted cleanly.\n`);

  console.log('🎉 ALL 7 TEST SUITES PASSED FLAWLESSLY! 🚀');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
