const express = require('express');
const path = require('path');
const User = require('../models/User');
const Video = require('../models/Video');
const { getAllVideos, createVideo, updateVideo, deleteVideo } = require('../controllers/videosController');
// const { get } = require('http');
const isAdmin = require('../middleware/isAdmin.js');


const router = express.Router();

// render videos page
router.get("/videos",getAllVideos);

// render add video page
router.get("/add-video",isAdmin, (req, res) => {
    res.render("add_video", { viewName: 'add_video' });
});

router.get("/videos/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const video = await Video.findById(id);
        if (!video) {
            return res.status(404).send("Video not found");
        }
        res.render("videos_viewer", { video, viewName: 'videos_viewer' });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving video");
    }
});

// handle add video form submission
router.post("/add-video",isAdmin, createVideo);

// handle edit video form submission
router.post("/update-video/:id",isAdmin, updateVideo);

// handle delete video form submission
router.post("/delete-video/:id",isAdmin, deleteVideo);

module.exports = router;