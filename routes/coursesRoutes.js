const express = require('express');
const coursesController = require('../controllers/coursesController.js');
const Course = require('../models/Course');
const router = express.Router();

router.get("/", async (req, res) => { 
    const courses = await Course.findAll(req.user.id);
    res.render("courses", {courses, viewName: 'courses'}); 
});
router.post("/:id/join",coursesController.joinCourse)
router.post("/get-assignments",coursesController.getAssignmentsForUserCourse)

module.exports = router;