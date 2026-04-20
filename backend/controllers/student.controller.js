const db = require("../config/db");

// CREATE STUDENT PROFILE
exports.createStudentProfile = (req, res) => {
  const user_id = req.user.user_id; // from JWT
  const { skills, branch, year, college_id } = req.body;

  if (!skills || !branch || !year) {
    return res.status(400).json({
      message: "Skills, branch, and year are required"
    });
  }

  // Check if profile already exists
  const checkQuery = "SELECT * FROM student WHERE user_id = ?";
  
  db.query(checkQuery, [user_id], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.length > 0) {
      return res.status(400).json({
        message: "Student profile already exists"
      });
    }

    // Insert profile
    const insertQuery = `
      INSERT INTO student (user_id, college_id, skills, branch, year)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
      insertQuery,
      [user_id, college_id || null, skills, branch, year],
      (err, result) => {
        if (err) return res.status(500).json(err);

        return res.status(201).json({
          message: "Student profile created successfully",
          student_id: result.insertId
        });
      }
    );
  });
};