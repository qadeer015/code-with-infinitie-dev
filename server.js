const express = require("express");
const app = express();
const port = 3000;
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const multer = require('multer');
require('dotenv').config();
const auththenticateUser = require("./middleware/auththenticateUser.js");
app.use(cookieParser());

const db = require("./config/db.js");
const authRoutes = require("./routes/authRoutes.js");
const userRoutes = require("./routes/userRoutes.js");
const videosRoutes = require("./routes/videosRoutes.js");

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

const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename for each file
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // allow up to 2MB
    fileFilter: (req, file, cb) => {
        const allowedFileTypes = /jpeg|jpg|png/;
        const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedFileTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error("Only .jpg, .jpeg, and .png files are allowed"));
        }
    }
});

app.use((req, res, next) => {
    res.locals.url = req.path; // Make `url` available in all views
    next();
});

app.use(auththenticateUser); // Attach user to req

app.use((req, res, next) => {
    res.locals.user = req.user; // Makes `user` available in EJS
    next();
});
app.get("/",(req,res)=>{
    res.render("index");
});
app.use("/auth",authRoutes);
app.use("/users",userRoutes);
app.use("/api",videosRoutes)

app.get("/search",async(req,res)=>{
        const {query} = req.query;
        if(!query){
            return res.render("search_result",{query});
        }
        try {
            // Use async/await for MySQL2 promise-based queries
            const [userResults] = await db.query("SELECT * FROM users WHERE name LIKE ? OR email LIKE ? OR role LIKE ? OR page_link LIKE ? OR repository_link LIKE ? OR avatar LIKE ? ORDER BY name ASC", ["%"+query+"%", "%"+query+"%", "%"+query+"%", "%"+query+"%", "%"+query+"%", "%"+query+"%"]);
            const [videoResults] = await db.query("SELECT * FROM videos WHERE title LIKE ? OR description LIKE ? OR iframe_link LIKE ? ORDER BY title ASC", ["%"+query+"%", "%"+query+"%", "%"+query+"%"]);
            const totalResults = userResults.length + videoResults.length;
            res.render("search_result", { query, userResults, videoResults, totalResults });
        } catch (err) {
            console.error(err);
            res.status(500).send("Error retrieving user");
        }
});

app.get("/assignments", (req, res) => {
    res.render("assignments");
});

app.get("/announcements", (req, res) => {
    res.render("announcements");
});

app.get('*', (req, res) => {
    res.status(404).render('notfound');
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});