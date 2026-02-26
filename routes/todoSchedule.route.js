const express = require('express');
const router = express.Router();
const todoScheduleController = require('../controllers/todoScheduleController');

router.get('/', todoScheduleController.renderCalendar);
// Get all schedules for a session
router.get('/session/:session_id',  todoScheduleController.getAllSchedules);

// Get calendar events
router.get('/:session_id/events',  todoScheduleController.getCalendarEvents);

// Get upcoming events
router.get('/:session_id/upcoming',  todoScheduleController.getUpcomingEvents);

// Update status
router.patch('/todo_schedules/:id/status',  todoScheduleController.updateStatus);
module.exports = router;