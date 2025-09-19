const express = require('express');
const { upload } = require('../middleware/cloudinaryUpload'); // Update this line
const { signup, login, logout, showTerms, showPrivacy } = require('../controllers/authController');
const { vi } = require('date-fns/locale');

const router = express.Router();

// Render login page
router.get('/login', (req, res) => {
    res.render('auth/login', { user: req.session.user || null, viewName: 'login' });
});

// Handle login form submission
router.post('/login', login);

// Render logout page
router.get('/logout', logout);

// New routes for terms and privacy
router.get('/terms', showTerms);
router.get('/privacy', showPrivacy);

module.exports = router;