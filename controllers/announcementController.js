const Announcement = require('../models/Announcement');
const { format } = require('date-fns');
require('dotenv').config();

// Function to format timestamp
function formatTimestamp(timestamp) {
    return format(new Date(timestamp), "MMMM dd, yyyy hh:mm a");
}

const showCourseAnnouncements = async (req, res) => {
    const { course_id } = req.query;
    try {
        console.log('course id : ', course_id);
        const announcements = await Announcement.getAnnouncementsByCourseId(course_id);
        console.log('announcements : ', announcements);
        res.render("announcements", { announcements })
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
            created_at: formatTimestamp(announcement.created_at)
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
