const express = require('express');
const multer = require('multer');
const path = require('path'); // path module
const User = require('../models/User');
const { editUser, getStudents, deleteUser, blockUser, unblockUser } = require('../controllers/userController');
// const { get } = require('http');
const auththenticateUser = require('../middleware/auththenticateUser.js');
const isAdmin = require('../middleware/isAdmin.js');


const router = express.Router();

const storage = multer.diskStorage({
    destination: './public/uploads/', // ✅ Ensure this folder exists
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

router.get("/students",auththenticateUser,isAdmin,(req, res) => {
    res.render("admin/student/index");
});

router.get("/get-students",auththenticateUser,isAdmin,getStudents);

// render edit form page
router.get("/edit/:id",auththenticateUser,async (req, res) => {
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

router.get("/:id/profile",auththenticateUser, async (req,res)=>{
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

router.post("/block/:id",isAdmin, blockUser);

router.post("/unblock/:id",isAdmin, unblockUser);


// Render home page
router.get('/admin/dashboard',auththenticateUser,isAdmin, (req, res) => {
    res.render('admin/dashboard',{req:req.session.user || null});
});


module.exports = router;
