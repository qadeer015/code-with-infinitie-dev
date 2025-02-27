const express = require('express');
const Announcement = require('../models/Announcement');
const { getAllAnnouncements, createAnnouncement } = require('../controllers/announcementController');
const router = express.Router();
const isAdmin = require('../middleware/isAdmin.js');


router.get("/",getAllAnnouncements);
router.post("/add-announcement/:id",isAdmin,createAnnouncement)

module.exports = router;