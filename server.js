const express = require("express");
const app = express();
const port = 3000;
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const auththenticateUser = require("./middleware/auththenticateUser.js");
const isAdmin = require('./middleware/isAdmin.js');
app.use(cookieParser());
//https://code-with-infinitie-dev-git-main-abdulqadeeeers-projects.vercel.app/assignments?course_id=30001
const db = require("./config/db.js");
const authRoutes = require("./routes/authRoutes.js");
const userRoutes = require("./routes/userRoutes.js");
const videosRoutes = require("./routes/videosRoutes.js");
const announcementRoutes = require("./routes/announcementRoutes.js");
const courseRoutes = require("./routes/coursesRoutes.js");
const assignmentsRoutes = require("./routes/assignmentsRoutes.js");
const adminRoutes = require("./routes/adminRoutes.js");

const FeaturedCourse = require('./models/FeaturedCourse.js');


// Set up EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
const session = require('express-session');

app.use(session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // For form data


app.use(express.static(path.join(__dirname, 'public')));
app.use('/img', express.static(path.join(__dirname, 'public/img')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.use((req, res, next) => {
    res.locals.url = req.path; // Making `url` available in all views
    next();
});

app.use(auththenticateUser); // Attaching user to req

app.use((req, res, next) => {
    res.locals.user = req.user; // setting user in ejs
    next();
});

// server.js
app.get("/", async (req, res) => {
    try {
        if (req.user) {
            // User is logged in - fetch courses using promise-based query
            const [courses] = await db.execute(
                `SELECT 
        c.*,
        (
            SELECT COUNT(*) 
            FROM assignments a
            LEFT JOIN assignment_submissions asub ON 
                a.id = asub.assignment_id AND 
                asub.user_id = ?
            WHERE 
                a.course_id = c.id AND
                (asub.id IS NULL OR (asub.status = 'pending' AND a.due_date > NOW()))
        ) AS unsubmitted_count,
        (
            SELECT COUNT(*)
            FROM announcements ann
            WHERE ann.course_id = c.id
        ) AS announcements_count
    FROM courses c
    JOIN user_courses uc ON c.id = uc.course_id
    WHERE uc.user_id = ?`,
                [req.user.id, req.user.id]
            );
            res.render("dashboard", {
                user: req.user,
                courses,
                viewName: 'dashboard'
            });
        } else {
            const featuredCourses = await FeaturedCourse.getAll();
            // User is not logged in
            res.render("index", { featuredCourses, viewName: 'index' });
        }
    } catch (err) {
        console.error("Error in root route:", err);
        res.status(500).render("error");
    }
});

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/api", videosRoutes);
app.use("/announcements", announcementRoutes);
app.use("/courses", courseRoutes);
app.use("/assignments", assignmentsRoutes);
app.use("/users/admin", isAdmin, adminRoutes);

app.get("/search", async (req, res) => {
    const { query } = req.query;
    if (!query) {
        return res.render("search_result", { query , viewName: 'search_result'});
    }
    try {
        let userResults = [];
        // Use async/await for MySQL2 promise-based queries
        if (req.user.role == "admin") {
            const [results] = await db.query("SELECT * FROM users WHERE name LIKE ? OR email LIKE ? OR role LIKE ? OR page_link LIKE ? OR repository_link LIKE ? OR avatar LIKE ? ORDER BY name ASC", ["%" + query + "%", "%" + query + "%", "%" + query + "%", "%" + query + "%", "%" + query + "%", "%" + query + "%"]);
            userResults.push(...results);
        }
        const [videoResults] = await db.query("SELECT * FROM videos WHERE title LIKE ? OR description LIKE ? OR iframe_link LIKE ? ORDER BY title ASC", ["%" + query + "%", "%" + query + "%", "%" + query + "%"]);
        const totalResults = userResults.length + videoResults.length;
        res.render("search_result", { query, userResults, videoResults, totalResults, viewName: 'search_result' });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error retrieving user");
    }
});

app.get("/about", (req, res) => {
    res.render("about", { viewName: 'about' });
});

app.get("/faqs", (req, res) => {
    res.render("faqs", { viewName: 'faqs' });
});

app.get('*', (req, res) => {
    res.status(404).render('notfound', { viewName: 'notfound' });
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});