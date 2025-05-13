const Course = require('../models/Course');
const UserCourse = require("../models/UserCourse")

const createCourse = async (req, res) => {
    try {
        const { title, description, course_duration, course_fee, status } = req.body;
        const course = await Course.createCourse(title, description, course_duration, course_fee, status);
        res.status(201).json(course);
    } catch (err) {
        console.error(err);
    }
}

const getAllCourses = async (req, res) => {
    try {
        const courses = await Course.findAll();
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
        res.status(201).json(joinedCourse);
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

module.exports = {
    createCourse,
    joinCourse,
    getUserCourses,
    getAssignmentsForUserCourse,
    getAllCourses
}