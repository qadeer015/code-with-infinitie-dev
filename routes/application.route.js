const { authenticate, authorize } = require("../middlewares/auththenticate.js");

// Manually import all route files
const pageRoutes = require("./page.route.js");
const authRoutes = require("./auth.route.js");
const userRoutes = require("./user.route.js");
const announcementRoutes = require("./announcement.route.js");
const courseRoutes = require("./course.route.js");
const assignmentRoutes = require("./assignment.route.js");
const lectureRoutes = require("./lecture.route.js");
const certificateRoutes = require("./certificate.route.js");
const todoScheduleRoutes = require("./todoSchedule.route.js");
const adminRoutes = require("./admin.route.js");
const instructorRoutes = require("./instructor.route.js");

module.exports = (app) => {
    // Public routes (no authentication required)
    app.use("/", pageRoutes);
    app.use("/auth", authRoutes);

    // Protected routes (authentication required)
    app.use("/users", authenticate, userRoutes);
    app.use("/announcements", authenticate, announcementRoutes);
    app.use("/courses", authenticate, courseRoutes);
    app.use("/assignments", authenticate, assignmentRoutes);
    app.use("/lectures", authenticate, lectureRoutes);
    app.use("/certificates", authenticate, certificateRoutes);
    app.use("/todo_schedule", authenticate, todoScheduleRoutes);

    // Role‑protected routes
    app.use("/admin", authenticate, authorize("admin"), adminRoutes);
    app.use("/instructor", authenticate, authorize("instructor"), instructorRoutes);
};