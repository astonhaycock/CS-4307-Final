// index.js
// Basic Express backend connecting to Amazon RDS MySQL

require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
const port = process.env.PORT || 3000;

// Create a connection pool to your RDS instance
const pool = mysql.createPool({
  host: process.env.DB_HOST,       // e.g. mydb.abcdefg12345.us-west-2.rds.amazonaws.com
  user: process.env.DB_USER,       // your DB username
  password: process.env.DB_PASSWORD, // your DB password
  database: process.env.DB_NAME,   // your database name
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Middleware to parse JSON bodies
app.use(express.json());

// Health-check endpoint
app.get('/', (req, res) => {
  res.send('Express + MySQL RDS backend is up!');
});

// Example: GET all users
app.get('/users', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users');
    res.json(rows);
  } catch (err) {
    console.error('DB query error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// create a user table

app.get('/create-table', async (req, res) => {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE
      )
    `;
    await pool.query(createTableQuery);
    res.send('Users table created or already exists.');
  } catch (err) {
    console.error('DB create table error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
);

// Example: POST a new user
app.post('/users', async (req, res) => {
  const { name, email } = req.body;
  try {
    const [result] = await pool.execute(
      'INSERT INTO users (name, email) VALUES (?, ?)',
      [name, email]
    );
    res.status(201).json({ id: result.insertId, name, email });
  } catch (err) {
    console.error('DB insert error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// .env file example:
// DB_HOST=my-rds-endpoint.amazonaws.com
// DB_USER=admin
// DB_PASSWORD=yourPassword
// DB_NAME=mydatabase
// DB_PORT=3306
