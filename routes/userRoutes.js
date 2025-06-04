const express = require('express');
const User = require('../models/User');
const upload = require('../middleware/cloudinaryUpload');
const { editUser, deleteUser } = require('../controllers/userController');

const router = express.Router();

// render edit form page
router.get("/edit/:id",async (req, res) => {
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

router.get("/:id/profile", async (req,res)=>{
    try {
        const userId = req.params.id;
        const userProfile = await User.findById(userId);
        if (!userProfile) {
            return res.status(404).send("User not found");
        }
        if(userId != req.user.id && req.user.role != "admin"){
            return res.redirect("/");
        }
        res.render("profile", { userProfile, viewName: 'profile' });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving user");
    }
});

// Edit user profile
router.post("/edit/:id", upload('avatar'), editUser);

router.post("/delete/:id", deleteUser);


module.exports = router;
