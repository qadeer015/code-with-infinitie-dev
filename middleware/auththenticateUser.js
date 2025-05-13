const jwt = require("jsonwebtoken");

const authenticateUser = async (req, res, next) => {
    // List of public routes that don't require authentication
    const publicRoutes = [
        "/",
        "/auth/login", 
        "/auth/register",
        "/about",
        "/faqs"
    ];

    // Check if current route is public
    const isPublicRoute = publicRoutes.some(route => {
        // Handle both exact matches and startsWith for nested routes
        return req.path === route || req.path.startsWith(route + '/');
    });

    // Get token from cookies
    const token = req.cookies?.token;

    // If no token and route is public, continue
    if (!token) {
        req.user = null;
        if (isPublicRoute) {
            return next();
        }
        // Store the original URL for redirect after login
        req.session.returnTo = req.originalUrl;
        return res.redirect("/auth/login");
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Additional security checks
        if (!decoded.id || !decoded.email) {
            throw new Error("Invalid token payload");
        }

        // Attach user to request
        req.user = decoded;
        
        // For views (if using templating)
        res.locals.user = decoded;
        
        next();
    } catch (error) {
        console.error("Authentication error:", error.message);
        
        // Clear invalid token
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        // Different handling for API vs web routes
        if (req.path.startsWith('/api')) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        req.session.returnTo = req.originalUrl;
        return res.redirect("/auth/login");
    }
};

module.exports = authenticateUser;