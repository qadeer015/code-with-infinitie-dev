const express = require('express');
const assignmentsController = require('../controllers/assignmentsController.js');
const singleUpload = require('../middleware/uploadAssignment.js');
const router = express.Router();

router.get("/", assignmentsController.showCourseAssignments);

router.get("/:course_id/unsubmitted-count", assignmentsController.getUnsubmittedAssignemntCountsByCourseId);

router.post("/:id/submit",singleUpload,assignmentsController.submitAssignment);


module.exports = router;