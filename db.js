// db.js — MySQL Database Connection
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',         // XAMPP default: no password
  database: 'hospital_db',
  port: 3306
});

db.connect((err) => {
  if (err) {
    console.error('❌ MySQL connection failed:', err.message);
    console.error('Make sure XAMPP MySQL is running!');
    process.exit(1);
  }
  console.log('✅ Connected to MySQL database (hospital_db)');
});

module.exports = db;
