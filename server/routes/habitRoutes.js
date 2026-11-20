import express from 'express';
import { HabitController } from '../controllers/habitController.js';

const router = express.Router();

// GET /api/habits/history (Placed before /:id to avoid ID conflict)
router.get('/history', HabitController.getHistory);

// CRUD routes
router.get('/', HabitController.getHabits);
router.post('/', HabitController.createHabit);
router.get('/:id', HabitController.getHabitById);
router.put('/:id', HabitController.updateHabit);
router.delete('/:id', HabitController.deleteHabit);

// Toggle completion
router.post('/:id/toggle', HabitController.toggleHabit);

export default router;
