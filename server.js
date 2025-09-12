const express = require("express");
const app = express();
const port = 3000;
const path = require('path');
require('dotenv').config();
const cookieParser = require('cookie-parser');
app.use(cookieParser());
const cors = require('cors');
app.use(cors());
//https://code-with-infinitie-dev-git-main-abdulqadeeeers-projects.vercel.app/assignments?course_id=30001
const db = require("./config/db.js");
const authRoutes = require("./routes/authRoutes.js");
const userRoutes = require("./routes/userRoutes.js");
const announcementRoutes = require("./routes/announcementRoutes.js");
const courseRoutes = require("./routes/coursesRoutes.js");
const assignmentsRoutes = require("./routes/assignmentsRoutes.js");
const adminRoutes = require("./routes/adminRoutes.js");
const instructorRoutes = require("./routes/instructorRoutes.js");
const lecturesRoutes = require("./routes/lecturesRoutes.js");
const certificatesRoutes = require('./routes/certificatesRoutes.js');
const todoScheduleRoutes = require('./routes/todoScheduleRoutes.js');

const auththenticateUser = require("./middleware/auththenticateUser.js");
const isAdmin = require('./middleware/isAdmin.js');
const isInstructor = require('./middleware/isInstructor.js');

const SessionCourse = require('./models/SessionCourse.js');
const Session = require('./models/Session.js');
const Course = require("./models/Course.js")

// Set up EJS as the view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
const session = require('express-session');

app.use(session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/img', express.static(path.join(__dirname, 'public/img')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.use((req, res, next) => {
    res.locals.url = req.path; // Making `url` available in all views
    next();
});

app.use((err, req, res, next) => {
    console.error('Error:', err);

    res.status(500).render('error', { error: err.message || 'Internal Server Error' });
});


app.use(auththenticateUser); // Attaching user to req

app.use((req, res, next) => {
    res.locals.user = req.user; // setting user in ejs
    next();
});

// server.js
app.get("/", async (req, res) => {
    try {
        const activeSession = await Session.getActiveSession();
        if (req.user) {
            // User is logged in - fetch courses using promise-based query
            const courses = await Course.getUserCourses(req.user.id);
            res.render("user/dashboard", {
                user: req.user,
                courses,
                currentSession: activeSession || null,
                viewName: 'dashboard'
            });
        } else {
            if (activeSession) { 
                const sessionCourses = await SessionCourse.getBySessionId(activeSession.id);
                res.render("index", { sessionCourses, viewName: 'index' });
            }else{
                const sessionCourses = [];
                res.render("index", { sessionCourses, viewName: 'index' });
            }
        }
    } catch (err) {
        console.error("Error in root route:", err);
        res.status(500).render("error");
    }
});

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/announcements", announcementRoutes);
app.use("/courses", courseRoutes);
app.use("/assignments", assignmentsRoutes);
app.use("/lectures", lecturesRoutes);
app.use('/certificates', certificatesRoutes);
app.use("/todo_schedule", todoScheduleRoutes);
app.use("/admin", isAdmin, adminRoutes);
app.use("/instructor", isInstructor, instructorRoutes);


app.get("/about", (req, res) => {
    res.render("pages/about", { viewName: 'about' });
});

app.get("/faqs", (req, res) => {
    res.render("pages/faqs", { viewName: 'faqs' });
});

app.get('*', (req, res) => {
    res.status(404).render('pages/notfound', { viewName: 'notfound' });
});

app.listen(port, () => {
    console.log(`Server is listening on http://localhost:${port}`);
});