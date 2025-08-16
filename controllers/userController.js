const cloudinary = require('cloudinary').v2;
const User = require('../models/User');
require('dotenv').config();
const bcrypt = require('bcryptjs');

// Configure Cloudinary (if not already done in another file)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// userController.js
const editUser = async (req, res) => {
    try {
        const { id } = req.params; // Fixed destructuring
        const { name, email, role, page_link, repository_link, signature } = req.body;

        const userProfile = await User.findById(id);

        if (!userProfile) {
            return res.status(404).json({ message: 'User not found' });
        }

        let avatarUrl = userProfile.avatar;
        // If new file was uploaded
        if (req.file) {
            // Delete old avatar if it exists and is from Cloudinary
            if (userProfile.avatar && userProfile.avatar.includes('res.cloudinary.com')) {
                try {
                    const publicId = userProfile.avatar.split('/').slice(-2).join('/').split('.')[0];
                    await cloudinary.uploader.destroy(publicId);
                } catch (err) {
                    console.error('Error deleting old avatar:', err);
                }
            }
            avatarUrl = req.file.path;
        }

        // Ensure no undefined values are passed to the update
        const updatedUser = await User.updateUser(
            id,
            name !== undefined ? name : userProfile.name,
            email !== undefined ? email : userProfile.email,
            role !== undefined ? role : userProfile.role,
            avatarUrl,
            page_link !== undefined ? page_link : userProfile.page_link,
            repository_link !== undefined ? repository_link : userProfile.repository_link,
            signature !== undefined ? signature : userProfile.signature
        );

        if (updatedUser) {
            res.json({ success: true, message: 'Profile updated successfully' });
        } else {
            res.status(400).json({ success: false, message: 'Failed to update profile' });
        }
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ success: false, message: 'Error updating user' });
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

const editUserSignature = async (req, res) => {
    try {
        const { id } = req.params;
        const { signature } = req.body;
        const updatedSignature = await User.editUserSignature(id, signature);
        if (updatedSignature) {
            res.status(200).json({ message: 'Signature updated successfully' });
        } else {
            res.status(400).json({ message: 'Failed to update signature' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating signature' });
    }
}

const changePassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { oldPassword, newPassword, confirmPassword } = req.body;
        const user = await User.findById(id);
        
        if (req.user.id != id && req.user.role != 'admin') {
            return res.status(401).json({ success: false, message: 'Unauthorized access' });
        }

        if (req.user.role !== 'admin') {
            const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({success: false, message: 'Invalid old password. Please enter your correct old password to update your password.' });
            }

            if (newPassword !== confirmPassword) {
                return res.status(400).json({ success: false, message: 'New password and confirm password do not match. Please enter the same password in both fields.' });
            }

        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const updatedPassword = await User.changePassword(id, hashedPassword);
        
        if (updatedPassword) {
            res.status(200).json({ success: true, message: 'Password updated successfully' });
        } else {
            res.status(400).json({ success: false, message: 'Failed to update password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error updating password' });
    }
}

module.exports = { editUser, getStudents, deleteUser, blockUser, unblockUser, editUserSignature, changePassword };