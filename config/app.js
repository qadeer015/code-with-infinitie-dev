//config/app.js
const express = require("express");
const app = express();
const path = require('path');
require('dotenv').config();
const morgan = require("morgan");
const session = require('express-session');
const cookieParser = require('cookie-parser');
const methodOverride = require("method-override");
const expressLayouts = require("express-ejs-layouts");
app.use(cookieParser());
const cors = require('cors');
app.use(cors());

const { bindUser } = require("../middlewares/auththenticate.js");

const applicationRoutes = require("../routes/application.route.js");

app.use(expressLayouts);

app.set("layout", "layouts/application");

// Set up EJS as the view engine
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

app.use(session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use(express.json());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '50mb' }));
app.use(methodOverride("_method"));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(express.static(path.join(__dirname, '../public')));
app.use('/img', express.static(path.join(__dirname, '../public/img')));
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

app.use((err, req, res, next) => {
    console.error('Error:', err);

    res.status(500).render('error', { error: err.message || 'Internal Server Error' });
});

app.use(bindUser);

app.use((req, res, next) => {
    res.locals.url = req.path;
    res.locals.user = req.user || null;
    res.locals.title = "Infinitidev - " + (req.path === "/" ? "Home" : req.path.substring(1).charAt(0).toUpperCase() + req.path.substring(2));
    res.locals.layout = "layouts/application";

    if (req.path.startsWith("/admin")) {
        res.locals.layout = "layouts/admin";
    } else if (req.path.startsWith("/instructor")) {
        res.locals.layout = "layouts/instructor";
    }
    next();
});

applicationRoutes(app);

app.get('*', (req, res) => {
    res.status(404).render('application/pages/notfound', { viewName: 'notfound', title: "Page Not Found" });
});

module.exports = app;