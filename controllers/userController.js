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
        const deleteUsers = await User.findAll('deleted');
        res.render('students', { students,deleteUsers });
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
            res.redirect("/");
        } else {
            res.status(400).json({ message: 'Failed to delete user' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting user' });
    }
}

module.exports = {editUser, getStudents, deleteUser};