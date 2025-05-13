const express = require('express');
const multer = require('multer');
const { signup, login, logout } = require('../controllers/authController');

const router = express.Router();

// Multer Storage for Avatar Upload
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Render signup page
router.get('/register', (req, res) => {
    res.render('signup',{user:req.session.user || null});
});

// Handle signup form submission
router.post('/signup',upload.single('avatar'), signup);

// Render login page
router.get('/login', (req, res) => {
    res.render('login',{user:req.session.user || null});
});

// Handle login form submission
router.post('/login', login);

// Render logout page
router.get('/logout', logout);

module.exports = router;
