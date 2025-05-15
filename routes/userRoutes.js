const express = require('express');
const multer = require('multer');
const path = require('path'); // path module
const User = require('../models/User');
const { editUser, getStudents, deleteUser, blockUser, unblockUser } = require('../controllers/userController');
// const { get } = require('http');


const router = express.Router();

const storage = multer.diskStorage({
    destination: './public/uploads/', // ✅ Ensure this folder exists
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// render edit form page
router.get("/edit/:id",async (req, res) => {
    try {
        const userId = req.params.id;
        const userProfile = await User.findById(userId);
        if (!userProfile) {
            return res.status(404).send("User not found");
        }
        res.render("edit_user", { userProfile });
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
        res.render("profile", { userProfile });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving user");
    }
});

// Edit user 
router.post("/edit/:id", upload.single('avatar'), editUser);

router.post("/delete/:id", deleteUser);


module.exports = router;
