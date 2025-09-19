const TodoSchedule = require('../models/TodoSchedule');
const Session = require('../models/Session');
const SessionCourse = require('../models/SessionCourse');
const { formatDate } = require('../middleware/formateTime');

exports.getAllSchedules = async (req, res) => {
    try {
        let todoSchedules = await TodoSchedule.findAll();
        todoSchedules = todoSchedules.map(schedule => ({
            ...schedule,
            start_date: formatDate(schedule.start_date),
            end_date: formatDate(schedule.end_date)
        }));
        res.json(todoSchedules);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.newSchedule = async (req, res) => {
    try {
        const activeSession = await Session.getActiveSession();
        const sessions = await Session.findAll();
        const courses = await SessionCourse.getBySessionId(activeSession.id);
        res.render('admin/todoSchedule/new', {
            title: 'Schedule Calendar',
            activeSession,
            sessions,
            courses,
            viewName: 'new_todo_schedule'
        });
    } catch (error) {
        res.status(500).render('error', { message: error.message });
    }
};

exports.editSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        const todoSchedule = await TodoSchedule.findById(id);
        const sessions = await Session.findAll();
        const courses = await SessionCourse.getBySessionId(todoSchedule.session_id);
        res.render('admin/todoSchedule/edit', {
            title: 'Edit Schedule',
            todoSchedule,
            sessions,
            courses,
            viewName: 'edit_todo_schedule'
        });
    } catch (error) {
        res.status(500).render('error', { message: error.message });
    }
};

exports.getSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        const schedule = await TodoSchedule.findById(id);
        
        if (!schedule) {
            return res.status(404).json({ success: false, message: 'Schedule not found' });
        }
        
        res.json({ success: true, data: schedule });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createSchedule = async (req, res) => {
    try {
        const { session_id, course_id, title, description, type, start_date, end_date, status } = req.body;
        const created_by = req.user.id;
        
        const result = await TodoSchedule.create(
            session_id, course_id, title, description, type, start_date, end_date, created_by, status
        );
        
        res.status(201).redirect(`/admin/todo_schedules`);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        const { session_id, course_id, title, description, type, start_date, end_date, status } = req.body;
        const updated = await TodoSchedule.update(
            id, session_id, course_id, title, description, type, start_date, end_date, status
        );
        
        if (!updated) {
            return res.status(404).json({ success: false, message: 'Schedule not found' });
        }
        
        res.status(200).redirect(`/admin/todo_schedules`);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await TodoSchedule.delete(id);
        
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Schedule not found' });
        }
        
        res.json({ success: true, message: 'Schedule deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getCalendarEvents = async (req, res) => {
    try {
        const { session_id } = req.params;
        const events = await TodoSchedule.getCalendarEvents(session_id);
        res.json({ success: true, data: events });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getUpcomingEvents = async (req, res) => {
    try {
        const { session_id } = req.params;
        const { limit = 10 } = req.query;
        const events = await TodoSchedule.getUpcomingEvents(session_id, parseInt(limit));
        res.json({ success: true, data: events });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const updated = await TodoSchedule.updateStatus(id, status);
        
        if (!updated) {
            return res.status(404).json({ success: false, message: 'Schedule not found' });
        }
        
        res.json({ success: true, message: 'Status updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.renderCalendar = async (req, res) => {
    try {
        const activeSession = await Session.getActiveSession();
        if (activeSession) {
        const events = await TodoSchedule.getCalendarEvents(activeSession.id);
        res.render('user/todo_schedule', {
            title: 'Schedule Calendar',
            session_id: activeSession.id,
            events: JSON.stringify(events),
            viewName: 'todo_schedule' 
        });
        }else{
            res.render('user/todo_schedule', {
                title: 'Schedule Calendar',
                session_id: null,
                events: [],
                viewName: 'todo_schedule'
            });
        }
    } catch (error) {
        res.status(500).render('error', { message: error.message });
    }
};
