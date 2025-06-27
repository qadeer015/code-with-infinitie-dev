const express = require('express');
const User = require('../models/User');
const UserCourse = require('../models/UserCourse');
const upload = require('../middleware/cloudinaryUpload');
const { editUser, deleteUser } = require('../controllers/userController');
const db = require('../config/db');

const router = express.Router();

// render edit form page
router.get("/edit/:id", async (req, res) => {
    try {
        const userId = req.params.id;
        const userProfile = await User.findById(userId);
        if (!userProfile) {
            return res.status(404).send("User not found");
        }
        res.render("edit_user", { userProfile, viewName: 'edit_user' });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving user");
    }
});

router.get("/:id/profile", async (req, res) => {
    try {
        const userId = req.params.id;
        const userProfile = await User.findById(userId);
        if (!userProfile) {
            return res.status(404).send("User not found");
        }
        if (userId != req.user.id && req.user.role != "admin") {
            return res.redirect("/");
        }
            const [courses] = await db.execute(
                `SELECT 
        c.*,
        (
            SELECT COUNT(*) 
            FROM assignments a
            LEFT JOIN assignment_submissions asub ON 
                a.id = asub.assignment_id AND 
                asub.user_id = ?
            WHERE 
                a.course_id = c.id AND
                (asub.id IS NULL OR (asub.status = 'pending' AND a.due_date > NOW()))
        ) AS unsubmitted_count,
        (
            SELECT COUNT(*)
            FROM announcements ann
            WHERE ann.course_id = c.id
        ) AS announcements_count
    FROM courses c
    JOIN user_courses uc ON c.id = uc.course_id
    WHERE uc.user_id = ?`,
                [userId, userId]
            );

        res.render("profile", { userProfile, courses, viewName: 'profile' });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving user");
    }
});

router.get("/progress", async (req, res) => {
    try {
        const userCourses = await UserCourse.findUserCourses(req.user.id);
        res.render("progress", { userCourses, currentCourseId: userCourses[0].course_id, viewName: 'progress' });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving progress data");
    }
});

router.get("/achievements", async (req, res) => {
    try {
        const userCompletedCourses = await UserCourse.getCompletedCourses(req.user.id);
        res.render("achievements", { userCompletedCourses, viewName: 'achievements' });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving achievements data");
    }
});

// Edit user profile
router.post("/:id/edit", upload('avatar'), editUser);

// Edit user signature
router.post("/edit-signature", async (req, res) => {
    try {
        const { signature } = req.body;
        await User.updateSignature(req.user.id, signature);
        res.status(200).json({ message: "Signature updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error updating signature");
    }
});

router.post("/delete/:id", deleteUser);


module.exports = router;
