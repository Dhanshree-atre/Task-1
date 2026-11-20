import { HabitService, getTodayDate } from '../services/habitService.js';

export const HabitController = {
  // GET /api/habits
  async getHabits(req, res, next) {
    try {
      const habits = HabitService.getAllHabits();
      return res.status(200).json({
        success: true,
        data: habits,
        meta: {
          total: habits.length,
          today: getTodayDate()
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/habits/:id
  async getHabitById(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, error: 'Invalid habit ID' });
      }

      const habit = HabitService.getHabitById(id);
      if (!habit) {
        return res.status(404).json({ success: false, error: `Habit with ID ${id} not found` });
      }

      return res.status(200).json({
        success: true,
        data: habit
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/habits
  async createHabit(req, res, next) {
    try {
      const { title, description, category, color, icon, frequency, target_days_per_week } = req.body;

      // Validation
      if (!title || typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({ success: false, error: 'Habit title is required' });
      }

      if (title.trim().length > 100) {
        return res.status(400).json({ success: false, error: 'Habit title must be 100 characters or less' });
      }

      const newHabit = HabitService.createHabit({
        title,
        description,
        category,
        color,
        icon,
        frequency,
        target_days_per_week
      });

      return res.status(201).json({
        success: true,
        message: 'Habit created successfully',
        data: newHabit
      });
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/habits/:id
  async updateHabit(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, error: 'Invalid habit ID' });
      }

      const { title, description, category, color, icon, frequency, target_days_per_week } = req.body;

      if (title !== undefined && (!title || typeof title !== 'string' || !title.trim())) {
        return res.status(400).json({ success: false, error: 'Habit title cannot be empty' });
      }

      const updatedHabit = HabitService.updateHabit(id, {
        title,
        description,
        category,
        color,
        icon,
        frequency,
        target_days_per_week
      });

      if (!updatedHabit) {
        return res.status(404).json({ success: false, error: `Habit with ID ${id} not found` });
      }

      return res.status(200).json({
        success: true,
        message: 'Habit updated successfully',
        data: updatedHabit
      });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/habits/:id
  async deleteHabit(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, error: 'Invalid habit ID' });
      }

      const deleted = HabitService.deleteHabit(id);
      if (!deleted) {
        return res.status(404).json({ success: false, error: `Habit with ID ${id} not found` });
      }

      return res.status(200).json({
        success: true,
        message: 'Habit deleted successfully',
        data: { id }
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/habits/:id/toggle
  async toggleHabit(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, error: 'Invalid habit ID' });
      }

      const targetDate = req.body.date || getTodayDate();
      const notes = req.body.notes || '';

      const result = HabitService.toggleHabit(id, targetDate, notes);
      if (!result) {
        return res.status(404).json({ success: false, error: `Habit with ID ${id} not found` });
      }

      return res.status(200).json({
        success: true,
        message: result.completed ? 'Habit marked completed' : 'Habit unmarked',
        data: result
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/habits/history
  async getHistory(req, res, next) {
    try {
      const habitId = req.query.habitId ? parseInt(req.query.habitId, 10) : null;
      const days = req.query.days ? parseInt(req.query.days, 10) : 35;

      const historyData = HabitService.getHistoricalData(habitId, days);

      return res.status(200).json({
        success: true,
        data: historyData
      });
    } catch (error) {
      next(error);
    }
  }
};
