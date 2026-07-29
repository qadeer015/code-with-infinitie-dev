// controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { sendEmail } = require("../api/emailService");
const renderTemplate = require("../utils/templateRenderer");
const dotenv = require("dotenv");
dotenv.config();

// Cookie options for persistent login ("Remember Me")
const getCookieOptions = (rememberMe) => {
    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 60 * 60 * 1000 // 30 days or 1 hour
    };
};

const showSignup = (req, res) => {
    res.render('application/auth/signup', { title: 'Sign Up', user: req.user, viewName: 'signup' });
};

const handleSignup = async (req, res) => {
    try {
        const { name, password, email, confirmPassword, terms } = req.body;
        const avatarUrl = req.file ? req.file.path : null;
        
        // Validate required fields
        if (!terms || terms !== 'on') {
            return res.status(400).json({ status: 'error', message: "You must accept the terms and conditions" });
        }
        
        if (password !== confirmPassword) {
            return res.status(400).json({ status: 'error', message: "Passwords do not match" });
        }

        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ status: 'error', message: "User with this email already exists." });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        await User.create(name, hashedPassword, email, avatarUrl);
        
        // Auto-login after signup
        const user = await User.findByEmail(email);
        const token = jwt.sign(
            { id: user.id, role: user.role, email: user.email, name: user.name, avatar: user.avatar },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        
        res.cookie("token", token, getCookieOptions(false));
        
        const html = renderTemplate("welcome.html", {
            user_name: user.name,
            year: new Date().getFullYear(),
            app_name: "Code with Infinitidev",
            getting_started_link: `${req.protocol}://${req.get('host')}/`,
            unsubscribe_link: `${req.protocol}://${req.get('host')}/auth/login`
        });

        sendEmail({
            to: user.email,
            subject: "Welcome to Code with Infinitidev",
            text: "Thank you for registering with Code with Infinitidev",
            html,
        }).catch((err) => console.error("Error sending email:", err));

        return res.json({
            status: 'success',
            message: 'Registration successful',
            redirect: '/'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Error creating user' });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ status: 'error', message: 'Email is required' });
        }

        const user = await User.findByEmail(email);
        
        // Always return success for security (don't reveal if email exists)
        if (!user) {
            return res.json({
                status: 'success',
                message: 'If an account exists with this email, a password reset link has been sent.'
            });
        }

        // Generate reset token
        const resetToken = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        const resetLink = `${req.protocol}://${req.get('host')}/auth/reset-password/${resetToken}`;
        
        const html = renderTemplate("forgot-password.html", {
            user_name: user.name,
            reset_link: resetLink,
            year: new Date().getFullYear(),
            app_name: "Code with Infinitidev",
        });

        await sendEmail({
            to: user.email,
            subject: "Password Reset Request",
            text: "You have requested a password reset",
            html,
        });

        res.json({
            status: 'success',
            message: 'If an account exists with this email, a password reset link has been sent.'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'An error occurred. Please try again.' });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password, confirmPassword } = req.body;

        // If GET request, show the reset password form
        if (req.method === 'GET' || !req.body.password) {
            try {
                // Verify token validity
                jwt.verify(token, process.env.JWT_SECRET);
                return res.render('application/auth/reset-password', { 
                    title: 'Reset Password', 
                    user: req.user, 
                    viewName: 'reset-password',
                    token: token
                });
            } catch (err) {
                // Redirect to login with error message if token is invalid
                return res.redirect('/auth/login?error=invalid_token');
            }
        }

        // POST request - process password reset
        if (!password || password !== confirmPassword) {
            return res.status(400).json({ status: 'error', message: 'Passwords do not match or are missing' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.changePassword(decoded.id, hashedPassword);

        return res.json({
            status: 'success',
            message: 'Password has been reset successfully. You can now login.',
            redirect: '/auth/login'
        });
    } catch (error) {
        console.error(error);
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(400).json({ status: 'error', message: 'Invalid or expired reset token' });
        }
        res.status(500).json({ status: 'error', message: 'An error occurred. Please try again.' });
    }
};

const signWithGoogle = async (req, res) => {
    const user = req.user;

    const token = jwt.sign(
        { id: user.id, role: user.role, email: user.email, name: user.name, avatar: user.profile_photo },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );

    res.cookie("token", token, getCookieOptions(true)); // 30 days

    const html = renderTemplate("welcome.html", {
        user_name: user.name,
        year: new Date().getFullYear(),
        app_name: "Code with Infinitidev",
    });

    sendEmail({
        to: user.email,
        subject: "Sign in to Code with Infinitidev",
        text: "You have signed in to Code with Infinitidev",
        html,
    }).catch((err) => console.error("Error sending email:", err));

    if (user.role === "admin") return res.redirect("/admin/dashboard");
    if (user.role === "instructor") return res.redirect("/instructor/dashboard");
    res.redirect("/");
};

const login = async (req, res) => {
    try {
        const { email, password, rememberMe } = req.body;

        // Find user by email
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({ status: 'error', message: 'Invalid email.' });
        }

        if (user.status === "deleted") {
            return res.status(401).json({ status: 'error', message: 'No user found with this email.' });
        }

        if (user.status === "blocked") {
            return res.status(401).json({ status: 'error', message: 'Your account has been blocked. Please contact the admin.' });
        }

        // Validate password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ status: 'error', message: 'Invalid password. Please try again.' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, role: user.role, email: user.email, name: user.name, avatar: user.avatar },
            process.env.JWT_SECRET,
            { expiresIn: rememberMe ? '30d' : '1h' }
        );

        // Store token in cookie
        res.cookie("token", token, getCookieOptions(rememberMe));

        // ✅ Send JSON response with redirect path based on role
        let redirectPath = '/';
        if (user.role === "admin") {
            redirectPath = '/admin/dashboard';
        } else if (user.role === "instructor") {
            redirectPath = '/instructor/dashboard';
        }

        return res.json({
            status: 'success',
            message: 'Login successful',
            redirect: redirectPath
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Error logging in' });
    }
};

const logout = (req, res) => {
    res.clearCookie('token');
    res.redirect("/auth/login");
};

// Terms and Privacy Policy pages
const showTerms = (req, res) => {
    res.render('application/auth/terms', { title: 'Terms of Service', user: req.user, viewName: 'terms' });
};

const showPrivacy = (req, res) => {
    res.render('application/auth/privacy', { title: 'Privacy Policy', user: req.user, viewName: 'privacy' });
};

module.exports = { 
    showSignup,
    handleSignup,
    login, 
    logout,
    showTerms,
    showPrivacy,
    signWithGoogle,
    forgotPassword,
    resetPassword
};
