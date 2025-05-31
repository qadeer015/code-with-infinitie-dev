const FeaturedCourse = require('../models/FeaturedCourse');

const createFeaturedCourse = async (req, res) => {
    try {
        const { course_id, difficulty_lvl } = req.body;
        const featuredCourse = await FeaturedCourse.create(course_id, difficulty_lvl);
        res.status(201).json({ message: 'Featured course created successfully', featuredCourse });
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
        const { id } = req.body;
    try {
        const FeaturedCourse = await FeaturedCourse.delete(id);
        res.status(200).json({ message: 'Featured course deleted successfully' });
    } catch (err) {
        console.error(err);
    }
}

const updateFeaturedCourse = async (req, res) => {
    try {
        const { id, course_id, difficulty_lvl } = req.body;
        const updatedFeaturedCourse = await FeaturedCourse.update(id, course_id, difficulty_lvl);
        res.status(200).json({ message: 'Featured course updated successfully', updatedFeaturedCourse });
    } catch (err) {
        console.error(err);
    }
}

module.exports = {
    createFeaturedCourse,
    getAllFeaturedCourses,
    deleteFeaturedCourse,
    updateFeaturedCourse
}