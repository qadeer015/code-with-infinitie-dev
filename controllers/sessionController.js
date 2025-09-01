const Course = require('../models/Course');
const Session = require('../models/Session');
const SessionCourse = require('../models/SessionCourse');

const createSession = async (req, res) => {
    try {
        const { name, description, start_date, end_date, status, courses } = req.body;
        
        const sessionStatus = status || 'upcoming';

        const session = await Session.create(name, description, start_date, end_date, req.user.id, sessionStatus);
        
        courses.forEach(async (course) => {
            // Set difficulty_lvl to empty string for new session courses
            await SessionCourse.create(course, '', session.insertId);
        })

        res.status(201).redirect('/users/admin/sessions');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error creating session');
    }
}

const getAllSessions = async (req, res) => {
    try {
        const sessions = await Session.findAll();
        res.status(200).json(sessions);
    } catch (err) {
        console.error(err);
    }
}

const editSession = async (req, res) => {
    try {
        const { id } = req.params;
        const session = await Session.findById(id);
        let courses = await Course.getAll();
        const sessionCourses = await SessionCourse.getBySessionId(id);
        
        // Add session courses to the session object for the view
        session.courses = sessionCourses;

        res.status(200).render('admin/session/edit', {session, courses});
    } catch (err) {
        console.error(err);
        res.status(500).send('Error loading session edit page');
    }
}

const updateSession = async (req, res) => {
    try {
        const { name, description, start_date, end_date, status, courses } = req.body;
        await Session.update(req.params.id, name, description, start_date, end_date, status);
        const sessionCourses = await SessionCourse.getBySessionId(req.params.id);
        // Convert courses from request to array of numbers (they come as strings from form)
        const selectedCourseIds = Array.isArray(courses) 
            ? courses.map(id => parseInt(id)) 
            : [parseInt(courses)];
        // Get existing course IDs in this session
        const existingCourseIds = sessionCourses.map(sc => sc.id);
        // Process each selected course
        for (const courseId of selectedCourseIds) {
            const existingSessionCourse = sessionCourses.find(sc => sc.id === courseId);
            if (existingSessionCourse) {
                // Course already exists in session - update if needed (preserve difficulty_lvl)
                await SessionCourse.update(existingSessionCourse.id, {
                    course_id: courseId,
                    difficulty_lvl: existingSessionCourse.difficulty_lvl || '',
                    session_id: req.params.id
                });
            } else {
                // New course added to session - set difficulty_lvl to empty string
                await SessionCourse.create(courseId, '', req.params.id);
            }
        }
        
        // Remove courses that are no longer selected
        const coursesToRemove = sessionCourses.filter(sc => !selectedCourseIds.includes(sc.id));
        for (const courseToRemove of coursesToRemove) {
            await SessionCourse.delete(courseToRemove.session_course_id, courseToRemove.id); // Delete by session_course id
        }
        
        res.status(200).redirect('/users/admin/sessions');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating session');
    }
}

const deleteSession = async (req, res) => {
    try {
        const { id } = req.params;
        await Session.delete(id);
        res.status(200).redirect('/users/admin/sessions');
    } catch (err) {
        console.error(err);
    }
}

module.exports = {
    createSession,
    updateSession,
    deleteSession,
    getAllSessions,
    editSession
}