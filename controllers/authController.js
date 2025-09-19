const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
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

const signup = async (req, res) => {
    try {
        const { name, password, email, confirmPassword, terms } = req.body;
        console.log(req.file);
        console.log(req.body);
        const avatarUrl = req.file ? req.file.path : null;        // Validate required fields

        if (!terms || terms !== 'on') {
            return res.status(400).json({ message: "You must accept the terms and conditions" });
        }
        
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: "User with this email already exists." });
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
        res.status(201).redirect('/auth/login');
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating user' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password, rememberMe } = req.body;

        // Find user by email
        const user = await User.findByEmail(email);
        console.log(user);
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
    res.render('auth/terms', { title: 'Terms of Service', user: req.user, viewName: 'terms' });
};

const showPrivacy = (req, res) => {
    res.render('auth/privacy', { title: 'Privacy Policy', user: req.user, viewName: 'privacy' });
};

module.exports = { 
    signup, 
    login, 
    logout,
    showTerms,
    showPrivacy
};