const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const coursesController = require('../controllers/coursesController.js');
const announcementsController = require('../controllers/announcementController');
const assignmentsController = require('../controllers/assignmentsController.js');
const featuredCoursesController = require('../controllers/featuredCoursesController.js');
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
router.post("/delete/:id", userController.deleteUser);


// Courses
router.get("/courses",(req, res) => {res.render("admin/course/courses")});
router.get("/courses/get-all",coursesController.getAllCourses);
router.get("/courses/new",(req, res) => {res.render("admin/course/new_course")});
router.post("/courses/create",coursesController.createCourse)

//Featured Courses
router.get("/featured-courses", (req, res) => {
    res.render("admin/featuredCourse/index")
});
router.get("/featured-courses/get-all", featuredCoursesController.getAllFeaturedCourses);
router.get("/featured-courses/new", async (req, res) => { res.render("admin/featuredCourse/new", { courses: await Course.getAll() }) });
router.post("/featured-courses/create", featuredCoursesController.createFeaturedCourse);
router.post("/featured-courses/update", featuredCoursesController.updateFeaturedCourse);
router.post("/featured-courses/delete", featuredCoursesController.deleteFeaturedCourse);

// Assignments
router.get("/assignments", (req, res) => {
    res.render("admin/assignment/index")
});
router.get("/assignments/submitted", assignmentsController.getSubmittedAssignments);
router.get("/assignments/submitted/:id", assignmentsController.getSubmittedAssignmentDetails);
router.get("/assignments/get-all", assignmentsController.getAllAssignments);
router.get("/assignments/new", async (req, res) => { res.render("admin/assignment/new", { courses: await Course.getAll() }) });
router.post("/assignments/create", assignmentsController.createAssignment)
router.post("/assignments/:assignmentId/users/:userId/grade", assignmentsController.gradeAssignment)

// In your routes file
router.get('/files/:submissionId/:filename', assignmentsController.serveSubmissionFile);

// Announcements
router.get("/announcements", (req, res) => {
    res.render("admin/announcement/index")
});
router.get("/announcements/get-all", announcementsController.getAllAnnouncements);
router.get("/announcements/new", async (req, res) => { res.render("admin/announcement/new", { courses: await Course.getAll() }) });
router.post("/announcements/create", announcementsController.createAnnouncement)

module.exports = router;