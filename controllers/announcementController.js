const Announcement = require('../models/Announcement');
const formateTime = require('../middleware/formateTime');
require('dotenv').config();

const showCourseAnnouncements = async (req, res) => {
    const { course_id } = req.query;
    try {
        const courseAnnouncements = await Announcement.getAnnouncementsByCourseId(course_id);
        const announcements = courseAnnouncements.map(announcement => ({
            ...announcement,
            created_at: formateTime.formatRelativeTime(announcement.created_at)
        }))
        res.render("announcements", { announcements, viewName: 'announcements' });
    } catch (error) {
        console.error("Error retrieving announcements:", error);
        res.status(500).json({ message: 'Error retrieving announcements', error: error.message });
    }
}

// Get all announcements
const getAllAnnouncements = async (req, res) => {
    try {
        const announcements = await Announcement.getAllAnnouncements();

        if (!announcements) {
            return res.status(404).json({ message: 'No announcements found' });
        }

        // Format created_at for each announcement
        const formattedAnnouncements = announcements.map(announcement => ({
            ...announcement,
            created_at: formateTime.formatRelativeTime(announcement.created_at)
        }));

        res.status(200).json(formattedAnnouncements);
    } catch (error) {
        console.error("Error retrieving announcements:", error);
        res.status(500).json({ message: 'Error retrieving announcements', error: error.message });
    }
};

// Create a new announcement
const createAnnouncement = async (req, res) => {
    try {
        const { title, content, course_id } = req.body;

        await Announcement.createAnnouncement(title, content, course_id);
        res.redirect('/announcements');
    } catch (error) {
        console.error("Error creating announcement:", error);
        res.status(500).json({ message: 'Error creating announcement' });
    }
};

module.exports = {showCourseAnnouncements, getAllAnnouncements, createAnnouncement };
