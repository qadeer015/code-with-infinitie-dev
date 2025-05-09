const express = require('express');
const coursesController = require('../controllers/coursesController.js');
const router = express.Router();
const isAdmin = require('../middleware/isAdmin.js');


router.get("/",coursesController.getUserCourses);
router.post("/create",isAdmin,coursesController.createCourse)
router.post("/:id/join",coursesController.joinCourse)
router.post("/get-assignments",coursesController.getAssignmentsForUserCourse)

module.exports = router;