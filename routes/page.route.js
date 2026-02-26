const express = require('express');
const router = express.Router();

const SessionCourse = require('../models/SessionCourse.js');
const Session = require('../models/Session.js');
const Course = require("../models/Course.js")

// server.js
router.get("/", async (req, res) => {
    try {
        const activeSession = await Session.getActiveSession();
        if (req.user) {
            // User is logged in - fetch courses using promise-based query
            const courses = await Course.getUserCourses(req.user.id);
            res.render("application/user/dashboard", {
                user: req.user,
                courses,
                currentSession: activeSession || null,
                viewName: 'dashboard'
            });
        } else {
            if (activeSession) {
                const sessionCourses = await SessionCourse.getBySessionId(activeSession.id);
                res.render("application/index", { sessionCourses, viewName:"index", title: "Home" });
            } else {
                const sessionCourses = [];
                res.render("application/index", { sessionCourses, viewName:"index", title: "Home" });
            }
        }
    } catch (err) {
        console.error("Error in root route:", err);
        res.status(500).render("error");
    }
});

router.get("/about", (req, res) => {
    res.render("application/pages/about", { viewName: 'about', title: "About Us" });
});

router.get("/faqs", (req, res) => {
    res.render("application/pages/faqs", { viewName: 'faqs', title: "FAQs" });
});

module.exports = router;