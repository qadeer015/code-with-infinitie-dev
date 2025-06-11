const Course = require('../models/Course');
const UserCourse = require("../models/UserCourse")

const createCourse = async (req, res) => {
    try {
        const { title, description, course_duration, course_fee, status } = req.body;
        const course = await Course.createCourse(title, description, course_duration, course_fee, status);
        res.status(201).redirect('/users/admin/lectures/');
    } catch (err) {
        console.error(err);
    }
}

const getAllCourses = async (req, res) => {
    try {
        const courses = await Course.getAll();
        res.status(200).json(courses);
    } catch (err) {
        console.error(err);
    }
}

const getUserCourses = async (req, res) => {
    try {
        const userCourses = await UserCourse.findUserCourses(req.user.id);
        res.status(200).json(userCourses);
    } catch (err) {
        console.error(err);
    }
}

const joinCourse = async (req, res) => {
    try {
        const { user_id, course_id } = req.body;
        const joinedCourse = await UserCourse.joinCourse(user_id, course_id, new Date());
        if(!joinedCourse) return res.status(400).json({message:"Course already joined."});
        res.status(201).json({message:"Course enrolled Successfully.",joinedCourse});
    } catch (err) {
        console.error(err);
    }
}


const getAssignmentsForUserCourse = async (req, res) => {
    try {
        const { userId, courseId } = req.body;
        const assignments = await UserCourse.getUserAssignmentsByCourse(userId, courseId);
        res.status(200).json(assignments);
    } catch (err) {
        console.error(err);
    }
}

const editCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const course = await Course.findCourse(id);
        res.status(200).render('admin/course/edit', {course});
    } catch (err) {
        console.error(err);
    }
}
const updateCourse = async (req, res) => {
        try {
        const { title, description, course_duration, course_fee, status } = req.body;
        await Course.updateCourse(req.params.id, title, description, course_duration, course_fee, status);
        res.status(200).redirect('/users/admin/courses/');
    } catch (err) {
        console.error(err);
    }
}

const deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;
        await Course.deleteCourse(id);
        res.status(200).redirect('/users/admin/courses/');
    } catch (err) {
        console.error(err);
    }
}

module.exports = {
    createCourse,
    joinCourse,
    getUserCourses,
    getAssignmentsForUserCourse,
    getAllCourses,
    editCourse,
    updateCourse,
    deleteCourse
}