const User = require('../models/User');
require('dotenv').config();

const editUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role, page_link, repository_link} = req.body;
        let avatar = req.file ? `/uploads/${req.file.filename}` : null;
        const userProfile = await User.findById(id);
        if (!userProfile) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Keep old avatar if no new file uploaded
        if (!req.file) {
            avatar = userProfile.avatar; // Retain avatar
        }
        const updatedRole = role ? role : userProfile.role;
        const updatedUser = await User.updateUser(id, name, email, updatedRole, avatar, page_link, repository_link);
        if (updatedUser) {
            res.redirect("/");
        } else {
            res.status(400).json({ message: 'Failed to update user' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating user' });
    }
}

const getStudents = async (req, res) => {
    try {
        const students = await User.findAll('student');
        console.log("students");
        res.status(200).json(students);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving students' });
    }
}

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(id);
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
        console.log(id);
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
        console.log(id);
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