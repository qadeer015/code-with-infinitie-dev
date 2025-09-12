const express = require('express');
const User = require('../models/User');
const UserCourse = require('../models/UserCourse');
const userController = require('../controllers/userController');

const router = express.Router();

router.get("/:id/profile", userController.userProfile)

router.get("/progress", async (req, res) => {
    try {
        const userCourses = await UserCourse.findUserCourses(req.user.id);
        res.render("user/progress", { userCourses, currentCourseId: userCourses.length>0 ? userCourses[0].course_id : null, viewName: 'progress' });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving progress data");
    }
});

router.get("/achievements", async (req, res) => {
    try {
        const userCompletedCourses = await UserCourse.getCompletedCourses(req.user.id);
        res.render("user/achievements", { userCompletedCourses, viewName: 'achievements' });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving achievements data");
    }
});

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

router.post("/:id/delete", userController.deleteUser);

router.post("/:id/change-password", userController.changePassword);

module.exports = router;
