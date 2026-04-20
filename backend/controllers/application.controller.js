const db = require("../config/db");

// APPLY TO JOB
exports.applyJob = (req, res) => {
  const student_id = req.user.user_id; // from JWT
  const { job_id } = req.body;

  if (!job_id) {
    return res.status(400).json({
      message: "Job ID is required"
    });
  }

  // Step 1: check if already applied
  const checkQuery = `
    SELECT * FROM applications 
    WHERE student_id = ? AND job_id = ?
  `;

  db.query(checkQuery, [student_id, job_id], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.length > 0) {
      return res.status(400).json({
        message: "You already applied for this job"
      });
    }

    // Step 2: insert application
    const insertQuery = `
      INSERT INTO applications (student_id, job_id, status)
      VALUES (?, ?, 'applied')
    `;

    db.query(insertQuery, [student_id, job_id], (err, result) => {
      if (err) return res.status(500).json(err);

      return res.status(201).json({
        message: "Job applied successfully",
        application_id: result.insertId
      });
    });
  });
};

exports.getMyApplications = (req, res) => {
  const student_id = req.user.user_id;

const sql = `
  SELECT 
    a.application_id, 
    a.status, 
    a.applied_at, 
    j.title, 
    c.company_name 
  FROM applications a 
  JOIN jobs j ON a.job_id = j.job_id 
  JOIN company c ON j.company_id = c.company_id 
  WHERE a.student_id = ?
`;


  db.query(sql, [student_id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.status(200).json(result);
  });
};

