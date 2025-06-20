const Lecture = require("../models/Lecture")
const Course = require("../models/Course")

const createLecture = async (req, res) => {
    try {
        const { title, course_id, video_id, description, tasks, notes, status="closed" } = req.body;
        await Lecture.createLecture(title, course_id, video_id, description, tasks, notes, status);
        res.status(201).redirect('/users/admin/lectures/');
    } catch (err) {
        console.error(err);
    }
}

const getAllLectures = async (req, res) => {
    try {
        const lectures = await Lecture.getAll();
        res.status(200).json(lectures);
    } catch (err) {
        console.error(err);
    }
}

const getCourseLectures = async (req, res) => {
    try {
        const { course_id } = req.query;
        const lectures = await Lecture.findAll(course_id);
        res.status(200).json(lectures);
    } catch (err) {
        console.error(err);
    }
}

const updateLecture = async (req, res) => {
    try {
        const { title, course_id, video_id, description, tasks, notes, status="closed" } = req.body;
        
        // Remove duplicates from tasks and notes
        const cleanTasks = tasks ? [...new Set(tasks.split(',').map(t => t.trim()).filter(t => t))].join(',') : null;
        const cleanNotes = notes ? [...new Set(notes.split(',').map(n => n.trim()).filter(n => n))].join(',') : null;

        await Lecture.updateLecture(
            req.params.id, 
            title, 
            course_id, 
            video_id, 
            description, 
            cleanTasks, 
            cleanNotes, 
            status
        );
        
        res.status(200).redirect('/users/admin/lectures/');
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
}

const showLecture = async (req, res) => {
    try {
        const { id } = req.params;
        const course = await Course.findCourse(req.query.course_id);
        const lecture = await Lecture.getLectureDetails(id);
        res.status(200).render('lectures_viewer', { lecture, course, viewName: 'lectures_viewer' });
    } catch (err) {
        console.error(err);
    }
}

const deleteLecture = async (req, res) => {
    try {
        const { id } = req.params;
        const lecture = await Lecture.deleteLecture(id);
        res.status(200).redirect('/users/admin/lectures/');
    } catch (err) {
        console.error(err);
    }
}

module.exports = {
    createLecture,
    getAllLectures,
    getCourseLectures,
    updateLecture,
    deleteLecture,
    showLecture
}