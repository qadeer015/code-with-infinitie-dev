const express = require('express');
const coursesController = require('../controllers/coursesController.js');
const router = express.Router();
const isAdmin = require('../middleware/isAdmin.js');
const auththenticateUser = require("../middleware/auththenticateUser.js");


router.get("/",auththenticateUser, isAdmin,(req, res) => {res.render("admin/course/courses")});
router.get("/get-all",auththenticateUser, isAdmin,coursesController.getAllCourses);
router.get("/new",auththenticateUser,isAdmin,(req, res) => {res.render("admin/course/new_course")});
router.post("/create",isAdmin,coursesController.createCourse)
router.post("/:id/join",coursesController.joinCourse)
router.post("/get-assignments",coursesController.getAssignmentsForUserCourse)

module.exports = router;