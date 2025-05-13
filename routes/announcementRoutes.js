const express = require('express');
const announcementsController = require('../controllers/announcementController');
const router = express.Router();
const isAdmin = require('../middleware/isAdmin.js');
const Course = require('../models/Course');

router.get("/", isAdmin, (req, res) => { res.render("admin/announcement/index") });
router.get("/get-all", isAdmin, announcementsController.getAllAnnouncements);
router.get("/new", isAdmin, async (req, res) => { res.render("admin/announcement/new", { courses: await Course.findAll() }) });
router.post("/create", isAdmin, announcementsController.createAnnouncement)

module.exports = router;