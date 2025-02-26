const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const dotenv = require("dotenv");
dotenv.config();

const signup = async (req, res) => {
    try {
        const { name, password, email} = req.body;
        const avatar = req.file ? `/uploads/${req.file.filename}` : null;
        console.log("name :",name);
        console.log("email :",email);
        console.log("password :",password);
        console.log("avatar :",avatar);
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create(name, hashedPassword, email, avatar);
        res.redirect('/auth/login');
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating user' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(email, password);
        // Find user by email
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        if(user.role === "deleted"){
            return res.status(401).json({ message: 'No user found with this email.' });
        }
        // Validate password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, role: user.role, email: user.email, name: user.name, avatar: user.avatar },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        console.log("token :",token);
        console.log("user :",user);

        // Store token in HTTP-only cookie
        res.cookie("token", token, {
            httpOnly: true,  
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            maxAge: 60 * 60 * 1000 // 1 hour
        });
        // Redirect to home page
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error logging in' });
    }
};

const logout = (req, res) => {
    res.clearCookie('token');
    res.status(200).redirect("/auth/login");
};

module.exports = { signup, login, logout };