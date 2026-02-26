// routes/applicationRoutes.js
const path = require("path");
const { authenticate, authorize } = require("../middlewares/auththenticate.js");

module.exports = (app) => {

    const routesConfig = [
        { file: "page.route.js", path: "/", public: true },
        { file: "auth.route.js", path: "/auth", public: true },
        { file: "user.route.js", path: "/users" },
        { file: "announcement.route.js", path: "/announcements" },
        { file: "course.route.js", path: "/courses" },
        { file: "assignment.route.js", path: "/assignments" },
        { file: "lecture.route.js", path: "/lectures" },
        { file: "certificate.route.js", path: "/certificates" },
        { file: "todoSchedule.route.js", path: "/todo_schedule" },
        { file: "admin.route.js", path: "/admin", role: "admin" },
        { file: "instructor.route.js", path: "/instructor", role: "instructor" }
    ];

    routesConfig.forEach(({ file, path: routePath, public, role }) => {
        const route = require(path.join(__dirname, file));
        
        if (public) {
            app.use(routePath, route);
        }
        else if (role) {
            app.use(routePath, authenticate, authorize(role), route);
        }
        else {
            app.use(routePath, authenticate, route);
        }

    });
};