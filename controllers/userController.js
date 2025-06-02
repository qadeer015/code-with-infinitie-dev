const cloudinary = require('cloudinary').v2;
const User = require('../models/User');
require('dotenv').config();

// Configure Cloudinary (if not already done in another file)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const editUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role, page_link, repository_link } = req.body;
        
        // Get the existing user
        const userProfile = await User.findById(id);
        if (!userProfile) {
            return res.status(404).json({ message: 'User not found' });
        }

        let avatarUrl = userProfile.avatar; // Keep old avatar by default

        // If new file was uploaded
        if (req.file) {
            // Delete old avatar from Cloudinary if it exists
            if (userProfile.avatar) {
                try {
                    // Extract public_id from the URL (last part before file extension)
                    const publicId = userProfile.avatar.split('/').pop().split('.')[0];
                    await cloudinary.uploader.destroy(`user-avatars/${publicId}`);
                    console.log('Deleted old avatar from Cloudinary');
                } catch (err) {
                    console.error('Error deleting old avatar:', err);
                    // Continue even if deletion fails
                }
            }

            // Use the new avatar URL from Cloudinary
            avatarUrl = req.file.path; // or req.file.secure_url depending on Cloudinary version
        }

        // Update user data
        const updatedRole = role ? role : userProfile.role;
        const updatedUser = await User.updateUser(
            id, 
            name, 
            email, 
            updatedRole, 
            avatarUrl, 
            page_link, 
            repository_link
        );

        if (updatedUser) {
            res.redirect("/");
        } else {
            res.status(400).json({ message: 'Failed to update user' });
        }
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Error updating user' });
    }
};

const getStudents = async (req, res) => {
    try {
        const students = await User.findAll('student');
        res.status(200).json(students);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving students' });
    }
}

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await User.deleteUser(id);
        if (deleted) {
            res.status(200).json({ message: 'User deleted successfully' });
        } else {
            res.status(400).json({ message: 'Failed to delete user' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting user' });
    }
}

const blockUser = async (req, res) => {
    try {
        const { id } = req.params;
        const blocked = await User.blockUser(id);
        if (blocked) {
            res.status(200).json({ message: 'User blocked successfully' });
        } else {
            res.status(400).json({ message: 'Failed to block user' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error blocking user' });
    }
}

const unblockUser = async (req, res) => {
    try {
        const { id } = req.params;
        const unblocked = await User.unblockUser(id);
        if (unblocked) {
            res.status(200).json({ message: 'User unblocked successfully' });
        } else {
            res.status(400).json({ message: 'Failed to unblock user' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error unblocking user' });
    }
}

module.exports = {editUser, getStudents, deleteUser, blockUser, unblockUser};