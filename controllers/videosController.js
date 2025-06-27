const Video = require('../models/Video');
require('dotenv').config();

const getAllVideos = async (req, res) => {
    try {
        const videos = await Video.getAll();
        res.render('admin/video/index', { videos, viewName: 'index' });
    } catch (error) {
        console.error("Error retrieving videos:", error);
        res.status(500).json({ message: 'Error retrieving videos' });
    }
};

const createVideo = async (req, res) => {
    try {
        const { title, description, iframe_link, minutes, seconds } = req.body;
        const totalSeconds = parseInt(minutes || 0) * 60 + parseInt(seconds || 0);
        await Video.create(title, description, iframe_link, totalSeconds);
        res.redirect('/users/admin/videos/');
    } catch (error) {
        console.error("Error creating video:", error);
        res.status(500).json({ message: 'Error creating video' });
    }
};

const updateVideo = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, iframe_link, minutes, seconds } = req.body;
        const totalSeconds = parseInt(minutes || 0) * 60 + parseInt(seconds || 0);
        const updated = await Video.updateVideo(id, title, description, iframe_link, totalSeconds);
        if (updated) {
            res.redirect('/users/admin/videos/');
        } else {
            res.status(400).json({ message: 'Failed to update video' });
        }
    } catch (error) {
        console.error("Error updating video:", error);
        res.status(500).json({ message: 'Error updating video' });
    }
};

const deleteVideo = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Video.deleteVideo(id);
        if (deleted) {
            res.redirect('/users/admin/videos/');
        } else {
            res.status(400).json({ message: 'Failed to delete video' });
        }
    } catch (error) {
        console.error("Error deleting video:", error);
        res.status(500).json({ message: 'Error deleting video' });
    }
};

module.exports = {
    getAllVideos,
    createVideo,
    updateVideo,
    deleteVideo
};