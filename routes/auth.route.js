// routes/auth.route.js
const express = require('express');
const { login, logout, showTerms, showPrivacy, signWithGoogle } = require('../controllers/authController');
const passport = require('passport');

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

module.exports = router;