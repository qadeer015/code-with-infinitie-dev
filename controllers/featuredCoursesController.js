const FeaturedCourse = require('../models/FeaturedCourse');
const Course = require('../models/Course');

const createFeaturedCourse = async (req, res) => {
    try {
        const { course_id, difficulty_lvl } = req.body;
        await FeaturedCourse.create(course_id, difficulty_lvl);
        res.status(201).redirect('/users/admin/featured-courses/');
    } catch (err) {
        console.error(err);
    }
}

const editFeaturedCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const featuredCourse = await FeaturedCourse.find(id);
        const courses = await Course.getAll();
        res.status(200).render('admin/featuredCourse/edit', { featuredCourse, courses });
    } catch (err) {
        console.error(err);
    }
}

const getAllFeaturedCourses = async (req, res) => {
    try {
        const FeaturedCourses = await FeaturedCourse.getAll();
        res.status(200).json(FeaturedCourses);
    } catch (err) {
        console.error(err);
    }
}

const deleteFeaturedCourse = async (req, res) => {
        const { id } = req.params;
    try {
        await FeaturedCourse.delete(id);
        res.status(200).redirect('/users/admin/featured-courses/');
    } catch (err) {
        console.error(err);
    }
}

const updateFeaturedCourse = async (req, res) => {
    try {
        const { course_id, difficulty_lvl } = req.body;
        await FeaturedCourse.update(req.params.id, course_id, difficulty_lvl);
        res.status(200).redirect('/users/admin/featured-courses/');
    } catch (err) {
        console.error(err);
    }
}

module.exports = {
    createFeaturedCourse,
    getAllFeaturedCourses,
    deleteFeaturedCourse,
    updateFeaturedCourse,
    editFeaturedCourse
}