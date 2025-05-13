const express = require('express');
const assignmentsController = require('../controllers/assignmentsController.js');
const router = express.Router();
const isAdmin = require('../middleware/isAdmin.js');
const Course = require('../models/Course');

router.get("/", isAdmin, (req, res) => { res.render("admin/assignment/index") });
router.get("/get-all", isAdmin, assignmentsController.getAllAssignments);
router.get("/new", isAdmin, async (req, res) => { res.render("admin/assignment/new", { courses: await Course.findAll() }) });
router.post("/create", isAdmin, assignmentsController.createAssignment)

module.exports = router;