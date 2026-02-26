const jwt = require("jsonwebtoken");

const bindUser = (req, res, next) => {
    const token = req.cookies?.token;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            res.locals.user = decoded;
        } catch (error) {
            console.error("Error decoding token:", error);
        }
    }
    next();
};

const authenticate = async (req, res, next) => {
    // Get token from cookies
    const token = req.cookies?.token;

    // If no token and route is public, continue
    if (!token) {
        req.user = null;
        res.locals.user = null;

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

const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. User not authenticated.'
            });
        }

        const userRole = req.user.role;

        // Check if user role is in allowed roles
        if (!allowedRoles.includes(userRole)) {
            if (req.xhr || req.headers.accept?.includes('application/json')) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. Insufficient permissions.'
                });
            } else {
                req.flash('error_msg', 'You do not have permission to access this page.');
                return res.redirect('/dashboard');
            }
        }

        // Additional permission checks based on user role
        switch (userRole) {
            case 'admin':
                break;

            case 'hr':
                if (req.params.companyId && req.params.companyId !== req.user.companyId) {
                    return res.status(403).json({
                        success: false,
                        message: 'Access denied. You can only access your company data.'
                    });
                }
                break;

            case 'employee':
                if (req.params.userId && req.params.userId !== req.user.id) {
                    return res.status(403).json({
                        success: false,
                        message: 'Access denied. You can only access your own data.'
                    });
                }
                break;
        }

        next();
    };
};

module.exports = { authenticate, authorize, bindUser };