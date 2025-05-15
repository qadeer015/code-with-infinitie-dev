const express = require('express');
const assignmentsController = require('../controllers/assignmentsController.js');
const Assignment = require('../models/Assignment');
const router = express.Router();

router.get("/", async (req, res) => { 
    const { course_id } = req.query;
    console.log('course id : ',course_id);
    const assignments = await Assignment.getAssignmentsByCourseId(course_id);
    res.render("assignments", {assignments}); 
});

module.exports = router;