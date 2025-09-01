const SessionCourse = require('../models/SessionCourse');
const Session = require('../models/Session');
const Course = require('../models/Course');

const createSessionCourse = async (req, res) => {
    try {
        const { course_id, difficulty_lvl, session_id } = req.body;
        await SessionCourse.create(course_id, difficulty_lvl, session_id);
        res.status(201).redirect('/users/admin/session-courses/');
    } catch (err) {
        console.error(err);
    }
}

const editSessionCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const sessionCourse = await SessionCourse.getBySessionId(id);
        res.status(200).render('admin/sessionCourse/edit', { sessionCourse, session_id: id });
    } catch (err) {
        console.error(err);
    }
}

const getSessionCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const sessionCourse = await SessionCourse.getBySessionId(id);
        res.status(200).json(sessionCourse);
    } catch (err) {
        console.error(err);
    }
}

const getAllSessionCourses = async (req, res) => {
    try {
        const sessions = await Session.findAll();
       
        // use Promise.all to wait for all course lookups
        const sessionsWithCourses = await Promise.all(
            sessions.map(async (session) => {
                const courses = await SessionCourse.getBySessionId(session.id);
                return {
                    ...session,
                    courses
                };
            })
        );
        res.status(200).json(sessionsWithCourses);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch sessions with courses" });
    }
};

const deleteSessionCourse = async (req, res) => {
        const { id } = req.params;
    try {
        await SessionCourse.delete(id);
        res.status(200).redirect('/users/admin/session-courses/');
    } catch (err) {
        console.error(err);
    }
}

const updateSessionCourse = async (req, res) => {
    try {
        const { difficulty_lvl } = req.body; // object of { course_id: level }
        const session_id = req.params.id;

        // Loop through each course difficulty and update
        for (const [course_id, level] of Object.entries(difficulty_lvl)) {
            await SessionCourse.updateDifficulty(session_id, course_id, level);
        }

        res.status(200).redirect('/users/admin/session-courses/');
    } catch (err) {
        console.error("Error updating session courses:", err);
        res.status(500).send("Failed to update session courses");
    }
};


module.exports = {
    createSessionCourse,
    editSessionCourse,
    getAllSessionCourses,
    deleteSessionCourse,
    updateSessionCourse,
    getSessionCourse
}