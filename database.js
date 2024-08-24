const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost', // Replace with your database host
  user: 'ZaheerAhmed', // Replace with your MySQL username
  password: '786Pakistan@', // Replace with your MySQL password
  database: 'mydatabase' // Replace with your database name
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.stack);
    return;
  }
  console.log('Connected to MySQL as ID ' + connection.threadId);
});

// Optionally, you can add a query to test the connection
connection.query('SELECT 1 + 1 AS solution', (error, results, fields) => {
  if (error) throw error;
  console.log('The solution is: ', results[0].solution);
});

connection.end();
