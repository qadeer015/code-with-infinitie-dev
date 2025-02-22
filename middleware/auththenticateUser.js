const jwt = require("jsonwebtoken");

const auththenticateUser = async (req, res, next) => {
    const token = req.cookies?.token; // Get token from cookies safely

    // Allow access to login & signup pages even if user is not authenticated
    if (!token) {
        req.user = null;
        if (req.path.startsWith("/auth/login") || req.path.startsWith("/auth/signup")) {
            return next();
        }
        return res.redirect("/auth/login");
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach user data to request
        next();
    } catch (error) {
        req.user = null;
        res.clearCookie("token"); // Clear invalid token
        return res.redirect("/auth/login");
    }
};

module.exports = auththenticateUser;
