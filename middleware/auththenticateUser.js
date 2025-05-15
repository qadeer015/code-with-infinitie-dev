const jwt = require("jsonwebtoken");

const authenticateUser = async (req, res, next) => {
    // List of public routes that don't require authentication
    const publicRoutes = [
        "/",
        "/auth/login", 
        "/auth/register",
        "/auth/signup",
        "/auth/terms",
        "/auth/privacy",
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
        res.locals.user = null;
        
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
        res.locals.user = decoded;
        
        // Check if token is about to expire (within 1 day) and needs renewal
        const now = Math.floor(Date.now() / 1000);
        const isPersistentSession = decoded.exp - now > 86400 * 3; // More than 3 days remaining
        
        if (decoded.exp - now < 86400 && decoded.exp - now > 0 && isPersistentSession) {
            // Renew token for persistent sessions ("Remember Me")
            const newToken = jwt.sign(
                { 
                    id: decoded.id, 
                    role: decoded.role, 
                    email: decoded.email, 
                    name: decoded.name, 
                    avatar: decoded.avatar 
                },
                process.env.JWT_SECRET,
                { expiresIn: '30d' }
            );
            
            // Set renewed cookie
            res.cookie("token", newToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
            });
        }
        
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

        // For web routes, redirect to login but allow public routes
        if (!isPublicRoute) {
            req.session.returnTo = req.originalUrl;
            return res.redirect("/auth/login");
        }
        
        req.user = null;
        res.locals.user = null;
        next();
    }
};

module.exports = authenticateUser;