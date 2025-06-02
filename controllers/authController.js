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
        const avatar = req.file ? `/uploads/${req.file.filename}` : null;
        // Validate required fields
        if (!terms || terms !== 'on') {
            return res.status(400).json({ message: "You must accept the terms and conditions" });
        }
        
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create(name, hashedPassword, email, avatar);
        
        // Auto-login after signup
        const user = await User.findByEmail(email);
        const token = jwt.sign(
            { id: user.id, role: user.role, email: user.email, name: user.name, avatar: user.avatar },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.cookie("token", token, getCookieOptions(false));
        res.redirect('/');
        
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
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        
        if (user.role === "deleted") {
            return res.status(401).json({ message: 'No user found with this email.' });
        }
        
        if (user.status === "blocked") {
            return res.status(401).json({ message: 'Your account has been blocked. Please contact the admin.' });
        }
        
        // Validate password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate JWT token with different expiration based on "Remember Me"
        const token = jwt.sign(
            { id: user.id, role: user.role, email: user.email, name: user.name, avatar: user.avatar },
            process.env.JWT_SECRET,
            { expiresIn: rememberMe ? '30d' : '1h' }
        );

        // Store token in HTTP-only cookie
        res.cookie("token", token, getCookieOptions(rememberMe));

        if (user.role === "admin") {
            return res.redirect('/users/admin/dashboard');
        }
        
        // Redirect to home page
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error logging in' });
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