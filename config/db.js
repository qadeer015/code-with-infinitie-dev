const mysql = require("mysql2/promise");
require('dotenv').config();

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    ssl: {
        rejectUnauthorized: false
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Check connection
db.getConnection()
    .then(conn => {
        console.log("Connected to the database");
        conn.release();
    })
    .catch(err => {
        console.error("Database connection error:", err);
    });

module.exports = db;
