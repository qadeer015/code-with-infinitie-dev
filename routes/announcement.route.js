const express = require('express');
const announcementsController = require('../controllers/announcementController');
const router = express.Router();

router.get("/", announcementsController.showCourseAnnouncements);

module.exports = router;