const Announcement = require('../models/Announcement');
const { format } = require('date-fns');
require('dotenv').config();

// Function to format timestamp
function formatTimestamp(timestamp) {
    return format(new Date(timestamp), "MMMM dd, yyyy hh:mm a");
}

// Get all announcements
const getAllAnnouncements = async (req, res) => {
    try {
        const announcements = await Announcement.getAllAnnouncements();

        // Format created_at for each announcement
        const formattedAnnouncements = announcements.map(announcement => ({
            ...announcement,
            created_at: formatTimestamp(announcement.created_at)
        }));

        res.render('announcements', { announcements: formattedAnnouncements });
    } catch (error) {
        console.error("Error retrieving announcements:", error);
        res.status(500).json({ message: 'Error retrieving announcements' });
    }
};

// Create a new announcement
const createAnnouncement = async (req, res) => {
    try {
        const { title, content } = req.body;
        const id = req.params.id;
        console.log("id:", id);

        await Announcement.createAnnouncement(title, content, id);
        res.redirect('/announcements');
    } catch (error) {
        console.error("Error creating announcement:", error);
        res.status(500).json({ message: 'Error creating announcement' });
    }
};

module.exports = { getAllAnnouncements, createAnnouncement };
