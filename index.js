// index.js
// Basic Express backend connecting to Amazon RDS MySQL

require("dotenv").config();
const express = require("express");
const mysql = require("mysql2/promise");

const app = express();
const port = process.env.PORT || 3000;

// Create a connection pool to your RDS instance
const db = mysql.createPool({
  host: process.env.DB_HOST, // e.g. mydb.abcdefg12345.us-west-2.rds.amazonaws.com
  user: process.env.DB_USER, // your DB username
  password: process.env.DB_PASSWORD, // your DB password
  database: process.env.DB_NAME, // your database name
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Middleware to parse JSON bodies
app.use(express.json());

// Health-check endpoint
app.get("/", (req, res) => {
  res.send("Express + MySQL RDS backend is up!");
});

// Example: GET all users
app.get("/users", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM users");
    res.json(rows);
  } catch (err) {
    console.error("DB query error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// fetch all courses required for a specific student's major,
// along with information about whether the student has completed each course
// still need to figure out how  to  get  payload  back with data
app.get("/student_major_clases", async (req, res) => {
  // going to need student id from  the  frontend
  // so going  to  need  something  in the body
  try {
    const studnetMajorClasesQuery = `SELECT
    c.course AS course_code,
    c.course_name,
    c.credits,
    c.description,
    mr.requirement_type,
    mr.min_grade,
    mr.is_elective,
    sc.grade,
    sc.status AS completion_status,
    CASE
        WHEN sc.status = 'completed' AND sc.grade >= mr.min_grade THEN 'completed'
        WHEN sc.status = 'in-progress' THEN 'in-progress'
        WHEN sc.student_course_id IS NULL AND NOT EXISTS (
            SELECT 1 FROM prereqs p
            WHERE p.course = c.course
            AND NOT EXISTS (
                SELECT 1 FROM student_courses sc2
                WHERE sc2.student_id = s.student_id
                AND sc2.course = p.prereq
                AND sc2.status = 'completed'
            )
        ) THEN 'available'
        ELSE 'locked'
    END AS course_status
FROM
    students s
JOIN
    student_majors sm ON s.student_id = sm.student_id
JOIN
    majors m ON sm.major_id = m.major_id
JOIN
    major_requirements mr ON m.major_id = mr.major_id
JOIN
    courses c ON mr.course = c.course
LEFT JOIN
    student_courses sc ON s.student_id = sc.student_id AND c.course = sc.course
WHERE
    s.student_id = ? -- Replace with the specific student ID
    AND sm.status = 'active'
ORDER BY
    mr.requirement_type,
    mr.is_elective,
    c.course`;
    await db.query(studnetMajorClasesQuery);
    //
    //
    res.send("Need to figure out how to  get data back");
    //
    //
  } catch (err) {
    console.error("DB query student major classes error", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/preregs", async (req, res) => {
  // going to need something in the body for the query
  // its going to be the major ID  for  the  students  major
  try {
    const preregsQuery = `SELECT
    c1.course AS course_code,
    c1.course_name AS course_name,
    c2.course AS prereq_code,
    c2.course_name AS prereq_name
FROM
    majors m
JOIN
    major_requirements mr ON m.major_id = mr.major_id
JOIN
    courses c1 ON mr.course = c1.course
LEFT JOIN
    prereqs p ON c1.course = p.course
LEFT JOIN
    courses c2 ON p.prereq = c2.course
WHERE
    m.major_id = ? -- Replace with the specific major ID
ORDER BY
    c1.course, c2.course`;
    await db.query(preregsQuery);
    res.send("Major preregs query ");
  } catch (err) {
    console.error("DB query preregs error", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// create a user table

app.get("/create-table", async (req, res) => {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE
      )
    `;
    await db.query(createTableQuery);
    res.send("Users table created or already exists.");
  } catch (err) {
    console.error("DB create table error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Example: POST a new user
app.post("/users", async (req, res) => {
  const { name, email } = req.body;
  try {
    const [result] = await db.execute(
      "INSERT INTO users (name, email) VALUES (?, ?)",
      [name, email]
    );
    res.status(201).json({ id: result.insertId, name, email });
  } catch (err) {
    console.error("DB insert error:", err);
    res.status(500).json({ error: "Internal Server Error" });
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
