// routes/auth.route.js
const express = require('express');
const { login, logout, showTerms, showPrivacy, signWithGoogle, showSignup, handleSignup, forgotPassword, resetPassword } = require('../controllers/authController');
const passport = require('passport');
const { single: uploadAvatar } = require('../middlewares/cloudinaryUpload');

const router = express.Router();

// Render login page
router.get('/login', (req, res) => {
    res.render('application/auth/login', { viewName: 'login' });
});

// Handle login form submission
router.post('/login', login);

// Render logout page
router.get('/logout', logout);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/auth/login',
        failureFlash: true,
        session: false,
    }),
    signWithGoogle
);

// New routes for terms and privacy
router.get('/terms', showTerms);
router.get('/privacy', showPrivacy);

// Signup routes
router.get('/register', showSignup);
router.post('/register', uploadAvatar('avatar'), handleSignup);

// Forgot Password routes
router.get('/forgot-password', (req, res) => {
    res.render('application/auth/forget-password', { viewName: 'forgot-password' });
});
router.post('/forgot-password', forgotPassword);

// Reset Password routes
router.get('/reset-password/:token', resetPassword);
router.post('/reset-password/:token', resetPassword);

module.exports = router;
