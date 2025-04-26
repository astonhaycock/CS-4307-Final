require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createPool } = require('mysql2/promise');

// Create a MySQL connection pool using RDS credentials from environment variables
const pool = createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const app = express();
app.use(cors());
app.use(express.json());

// Database access functions
async function getAllStudents() {
  try {
    const [rows] = await pool.query(`
      SELECT
        s.student_id,
        s.first_name,
        s.last_name,
        s.email,
        s.enrollment_date,
        m.major_id,
        m.major_name
      FROM db.students s
      LEFT JOIN db.student_majors sm ON s.student_id = sm.student_id
      LEFT JOIN db.majors m  ON sm.major_id   = m.major_id
    `);
    console.log(rows);
    return rows;
  } catch (err) {
    console.error('SQL error in getAllStudents():', err);
    throw err;
  }
}



async function getStudentById(studentId) {
  const [rows] = await pool.query(
    `SELECT
       s.student_id,
       s.first_name,
       s.last_name,
       s.email,
       s.enrollment_date,
       m.major_id,
       m.major_name
     FROM db.students s
     LEFT JOIN db.student_majors sm ON s.student_id = sm.student_id
     LEFT JOIN db.majors m       ON sm.major_id   = m.major_id
     WHERE s.student_id = ?`,
    [studentId]
  );
  return rows[0];
}

async function getStudentCourses(studentId) {
  const [rows] = await pool.query(
    `        SELECT 
            c.course_id,
            c.course_name,
            c.credits,
            sc.semester,
            sc.year,
            sc.grade,
            sc.status
        FROM 
            db.student_courses sc
        JOIN 
            db.courses c ON sc.course_id = c.course_id
        WHERE 
            sc.student_id = ?
        ORDER BY 
            sc.year, 
            CASE 
                WHEN sc.semester = 'Spring' THEN 1
                WHEN sc.semester = 'Summer' THEN 2
                WHEN sc.semester = 'Fall' THEN 3
            END`,
    [studentId]
  );
  return rows;
}

async function getStudentDegreeProgress(studentId) {
  const conn = await pool.getConnection();
  try {
    // Get student's major
    const [[major]] = await conn.query(
      `SELECT
         m.major_id,
         m.major_name,
         m.total_credits_required
       FROM db.student_majors sm
       JOIN db.majors m ON sm.major_id = m.major_id
       WHERE sm.student_id = ?`,
      [studentId]
    );
    if (!major) {
      return { error: 'Student has no declared major' };
    }

    // Fetch courses for major with status logic
    const [courses] = await conn.query(
      `SELECT
         c.course_id,
         c.course_name,
         c.credits,
         c.dept_code,
         CASE
           WHEN sc.status = 'completed' THEN 'Completed'
           WHEN sc.status = 'in-progress' THEN 'In Progress'
           WHEN NOT EXISTS (
             SELECT 1 FROM db.prerequisites p
             WHERE p.course_id = c.course_id
               AND NOT EXISTS (
                 SELECT 1 FROM db.student_courses sc2
                 WHERE sc2.student_id = ?
                   AND sc2.course_id = p.prereq_id
                   AND sc2.status = 'completed'
               )
           ) THEN 'Available'
           ELSE 'Locked'
         END AS status,
         sc.grade,
         mr.is_required
       FROM db.major_requirements mr
       JOIN db.courses c ON mr.course_id = c.course_id
       LEFT JOIN db.student_courses sc
         ON sc.student_id = ? AND sc.course_id = c.course_id
       WHERE mr.major_id = ?
       ORDER BY
         CASE
           WHEN sc.status = 'completed' THEN 1
           WHEN sc.status = 'in-progress' THEN 2
           WHEN NOT EXISTS (
             SELECT 1 FROM db.prerequisites p2
             WHERE p2.course_id = c.course_id
               AND NOT EXISTS (
                 SELECT 1 FROM db.student_courses sc3
                 WHERE sc3.student_id = ?
                   AND sc3.course_id = p2.prereq_id
                   AND sc3.status = 'completed'
               )
           ) THEN 3
           ELSE 4
         END,
         c.course_id`,
      [studentId, studentId, major.major_id, studentId]
    );

    // Calculate credits and attach prerequisites
    let completed_credits = 0;
    for (let course of courses) {
      if (course.status === 'Completed') completed_credits += course.credits;
      const [prereqs] = await conn.query(
        `SELECT
           p.prereq_id,
           c.course_name AS prereq_name,
           CASE WHEN EXISTS (
             SELECT 1 FROM db.student_courses sc
             WHERE sc.student_id = ?
               AND sc.course_id = p.prereq_id
               AND sc.status = 'completed'
           ) THEN 1 ELSE 0 END AS is_completed
         FROM db.prerequisites p
         JOIN db.courses c ON p.prereq_id = c.course_id
         WHERE p.course_id = ?`,
        [studentId, course.course_id]
      );
      course.prerequisites = prereqs;
    }

    const progress_percentage =
      (completed_credits / major.total_credits_required) * 100;

    return {
      student_id: studentId,
      major,
      completed_credits,
      total_credits_required: major.total_credits_required,
      progress_percentage,
      courses,
    };
  } finally {
    conn.release();
  }
}

async function getPrereqGraphData(studentId) {
  const [[major]] = await pool.query(
    `SELECT
       m.major_id,
       m.major_name
     FROM db.student_majors sm
     JOIN db.majors m ON sm.major_id = m.major_id
     WHERE sm.student_id = ?`,
    [studentId]
  );
  if (!major) return { error: 'Student has no declared major' };

  const [nodes] = await pool.query(
    `SELECT
       c.course_id,
       c.course_name,
       c.credits,
       CASE
         WHEN sc.status = 'completed' THEN 'Completed'
         WHEN sc.status = 'in-progress' THEN 'In Progress'
         WHEN NOT EXISTS (
           SELECT 1 FROM db.prerequisites p
           WHERE p.course_id = c.course_id
             AND NOT EXISTS (
               SELECT 1 FROM db.student_courses sc2
               WHERE sc2.student_id = ?
                 AND sc2.course_id = p.prereq_id
                 AND sc2.status = 'completed'
             )
         ) THEN 'Available'
         ELSE 'Locked'
       END AS status
     FROM db.major_requirements mr
     JOIN db.courses c ON mr.course_id = c.course_id
     LEFT JOIN db.student_courses sc
       ON sc.student_id = ? AND sc.course_id = c.course_id
     WHERE mr.major_id = ?`,
    [studentId, studentId, major.major_id]
  );

  const [links] = await pool.query(
    `SELECT
       p.course_id AS target,
       p.prereq_id AS source
     FROM db.prerequisites p
     JOIN db.major_requirements mr1 ON p.course_id = mr1.course_id
     JOIN db.major_requirements mr2 ON p.prereq_id = mr2.course_id
     WHERE mr1.major_id = ? AND mr2.major_id = ?`,
    [major.major_id, major.major_id]
  );

  return {
    student_id: studentId,
    major,
    nodes: nodes.map(c => ({ id: c.course_id, name: c.course_name, credits: c.credits, status: c.status })),
    links: links.map(l => ({ source: l.source, target: l.target })),
  };
}

async function getAllMajors() {
  const [rows] = await pool.query('SELECT * FROM db.majors');
  return rows;
}

async function getMajorById(id) {
  const [rows] = await pool.query(
    'SELECT * FROM db.majors WHERE major_id = ?',
    [id]
  );
  return rows[0];
}

async function getAllCourses() {
  const [rows] = await pool.query('SELECT * FROM db.courses');
  return rows;
}

async function getCourseById(id) {
  const [rows] = await pool.query(
    'SELECT * FROM db.courses WHERE course_id = ?',
    [id]
  );
  if (rows.length === 0) return null;
  const course = rows[0];

  // Attach prerequisites
  const [prereqs] = await pool.query(
    `SELECT
       p.prereq_id,
       c.course_name
     FROM db.prerequisites p
     JOIN db.courses c ON p.prereq_id = c.course_id
     WHERE p.course_id = ?`,
    [id]
  );
  course.prerequisites = prereqs;

  // Attach corequisites
  const [coreqs] = await pool.query(
    `SELECT
       co.coreq_id,
       c.course_name
     FROM db.corequisites co
     JOIN db.courses c ON co.coreq_id = c.course_id
     WHERE co.course_id = ?`,
    [id]
  );
  course.corequisites = coreqs;

  return course;
}

// Route handlers remain unchanged

app.get('/api/majors/:majorId/bottlenecks', async (req, res) => {
  const { majorId } = req.params;

  const sql = `
    WITH
      required_courses AS (
        SELECT course_id
          FROM db.major_requirements
         WHERE major_id    = ?
           AND is_required = 1
      ),
      prereq_counts AS (
        SELECT
          p.prereq_id   AS bottleneck_course,
          COUNT(DISTINCT p.course_id) AS total_unlocks
        FROM db.prerequisites p
        JOIN required_courses rc
          ON p.course_id = rc.course_id
        GROUP BY p.prereq_id
      ),
      prereq_cardinalities AS (
        SELECT
          course_id,
          COUNT(*) AS prereq_count
        FROM db.prerequisites
        GROUP BY course_id
      ),
      multi_unlocks AS (
        SELECT
          p.prereq_id   AS bottleneck_course,
          SUM(CASE WHEN pc.prereq_count > 1 THEN 1 ELSE 0 END) AS multi_unlocks
        FROM db.prerequisites p
        JOIN prereq_cardinalities pc
          ON p.course_id = pc.course_id
        JOIN required_courses rc
          ON p.course_id = rc.course_id
        GROUP BY p.prereq_id
      )
    SELECT
      pc.bottleneck_course,
      c.course_name,
      pc.total_unlocks,
      COALESCE(mu.multi_unlocks, 0) AS multi_unlocks
    FROM prereq_counts pc
    JOIN db.courses c
      ON c.course_id = pc.bottleneck_course
    LEFT JOIN multi_unlocks mu
      ON mu.bottleneck_course = pc.bottleneck_course
    ORDER BY pc.total_unlocks DESC
  `;

  try {
    const [rows] = await pool.query(sql, [majorId]);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching bottleneck courses:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get('/api/students', async (req, res) => {
  try {
    const { id } = req.query;
    if (id) {
      const student = await getStudentById(id);
      if (student) return res.json(student);
      return res.status(404).json({ error: 'Student not found' });
    }
    const students = await getAllStudents();
    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/students/:studentId/courses', async (req, res) => {
  try {
    const courses = await getStudentCourses(req.params.studentId);
    res.json(courses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/students/:studentId/degree-progress', async (req, res) => {
  try {
    const progress = await getStudentDegreeProgress(req.params.studentId);
    res.json(progress);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/students/:studentId/prereq-graph', async (req, res) => {
  try {
    const graph = await getPrereqGraphData(req.params.studentId);
    res.json(graph);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/majors', async (req, res) => {
  try {
    const { id } = req.query;
    if (id) {
      const major = await getMajorById(id);
      if (major) return res.json(major);
      return res.status(404).json({ error: 'Major not found' });
    }
    const majors = await getAllMajors();
    res.json(majors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/courses', async (req, res) => {
  try {
    const { id } = req.query;
    if (id) {
      const course = await getCourseById(id);
      if (course) return res.json(course);
      return res.status(404).json({ error: 'Course not found' });
    }
    const courses = await getAllCourses();
    res.json(courses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start server
const PORT = 3001;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
