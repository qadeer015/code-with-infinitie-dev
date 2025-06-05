const Lecture = require("../models/Lecture")

const createLecture = async (req, res) => {
    try {
        const { title, course_id, video_id, description, status="closed" } = req.body;
        await Lecture.createLecture(title, course_id, video_id, description, status);
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
        const { id, title, course_id, video_id, description, status } = req.body;
        const lecture = await Lecture.updateLecture(id, title, course_id, video_id, description, status);
        res.status(200).json(lecture);
    } catch (err) {
        console.error(err);
    }
}

const showLecture = async (req, res) => {
    try {
        const { id } = req.params;
        const lecture = await Lecture.getLectureDetails(id);
        console.log(lecture);
        res.status(200).render('lectures_viewer', { lecture, viewName: 'lectures_viewer' });
    } catch (err) {
        console.error(err);
    }
}

const deleteLecture = async (req, res) => {
    try {
        const { id } = req.body;
        const lecture = await Lecture.deleteLecture(id);
        res.status(200).json(lecture);
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