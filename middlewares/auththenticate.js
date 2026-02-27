// middlewares/auth.js
const jwt = require("jsonwebtoken");

// Bind user to req/res.locals (non‑blocking)
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

// Protect routes – redirects to login if no valid token
const authenticate = (req, res, next) => {
    const token = req.cookies?.token;

    if (!token) {
        // Store the original URL in a cookie (optional – can be omitted)
        res.cookie('returnTo', req.originalUrl, {
            httpOnly: false, // so frontend can read it if needed
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 5 * 60 * 1000 // 5 minutes
        });
        return res.redirect('/auth/login');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Basic payload validation
        if (!decoded.id || !decoded.email) {
            throw new Error("Invalid token payload");
        }

        req.user = decoded;
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

        // For web routes, redirect to login
        res.cookie('returnTo', req.originalUrl, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 5 * 60 * 1000
        });
        return res.redirect('/auth/login');
    }
};

// Role‑based authorization (no sessions)
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            if (req.path.startsWith('/api')) {
                return res.status(401).json({ success: false, message: 'Not authenticated' });
            }
            // Fallback: redirect to login (but ideally authenticate() already handled this)
            return res.redirect('/auth/login');
        }

        if (!allowedRoles.includes(req.user.role)) {
            if (req.path.startsWith('/api')) {
                return res.status(403).json({ success: false, message: 'Insufficient permissions' });
            }
            // Set a flash‑like message via cookie (optional) and redirect
            res.cookie('error_msg', 'You do not have permission to access this page.', {
                httpOnly: false,
                maxAge: 5000
            });
            return res.redirect('/dashboard');
        }

        // Optional data‑specific checks (you can keep them)
        switch (req.user.role) {
            case 'hr':
                if (req.params.companyId && req.params.companyId !== req.user.companyId) {
                    return res.status(403).json({ success: false, message: 'Access denied.' });
                }
                break;
            case 'employee':
                if (req.params.userId && req.params.userId !== req.user.id) {
                    return res.status(403).json({ success: false, message: 'Access denied.' });
                }
                break;
        }
        next();
    };
};

module.exports = { authenticate, authorize, bindUser };