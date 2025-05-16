const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const coursesController = require('../controllers/coursesController.js');
const announcementsController = require('../controllers/announcementController');
const assignmentsController = require('../controllers/assignmentsController.js');
const Course = require('../models/Course');

// Render home page
router.get('/dashboard', (req, res) => {
    res.render('admin/dashboard',{req:req.session.user || null});
});


// Students
router.get("/students",(req, res) => {
    res.render("admin/student/index");
});
router.get("/get-students",userController.getStudents);
router.post("/block/:id", userController.blockUser);
router.post("/unblock/:id", userController.unblockUser);

// Courses
router.get("/courses",(req, res) => {res.render("admin/course/courses")});
router.get("/courses/get-all",coursesController.getAllCourses);
router.get("/courses/new",(req, res) => {res.render("admin/course/new_course")});
router.post("/courses/create",coursesController.createCourse)

// Assignments
router.get("/assignments", (req, res) => {
    res.render("admin/assignment/index")
});
router.get("/assignments/submitted", assignmentsController.getSubmittedAssignments);
router.get("/assignments/submitted/:id", assignmentsController.getSubmittedAssignmentDetails);
router.get("/assignments/get-all", assignmentsController.getAllAssignments);
router.get("/assignments/new", async (req, res) => { res.render("admin/assignment/new", { courses: await Course.findAll() }) });
router.post("/assignments/create", assignmentsController.createAssignment)

// Announcements
router.get("/announcements", (req, res) => {
    res.render("admin/announcement/index")
});
router.get("/announcements/get-all", announcementsController.getAllAnnouncements);
router.get("/announcements/new", async (req, res) => { res.render("admin/announcement/new", { courses: await Course.findAll() }) });
router.post("/announcements/create", announcementsController.createAnnouncement)

module.exports = router;