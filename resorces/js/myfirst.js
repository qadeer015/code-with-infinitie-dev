const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'admin',
  password: 'your_actual_password', // Replace with the password you used in the MySQL monitor
  database: 'your_database_name'     // Replace with your actual database name
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database');
});
