const db = require("../config/db");

// CREATE JOB (COMPANY ONLY)
exports.createJob = (req, res) => {
  const user_id = req.user.user_id;
  const {
    title,
    description,
    skills_required,
    job_type,
    location,
    job_mode
  } = req.body;

  if (!title || !description || !skills_required || !job_type || !location || !job_mode) {
    return res.status(400).json({
      message: "All fields are required"
    });
  }

  // Step 1: Get company_id from user_id
  const getCompany = "SELECT company_id FROM company WHERE user_id = ?";

  db.query(getCompany, [user_id], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.length === 0) {
      return res.status(403).json({
        message: "Only company users can post jobs"
      });
    }

    const company_id = result[0].company_id;

    // Step 2: Insert job
    const insertJob = `
      INSERT INTO jobs 
      (company_id, title, description, skills_required, job_type, location, job_mode)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      insertJob,
      [
        company_id,
        title,
        description,
        skills_required,
        job_type,
        location,
        job_mode
      ],
      (err, result) => {
        if (err) return res.status(500).json(err);

        return res.status(201).json({
          message: "Job posted successfully",
          job_id: result.insertId
        });
      }
    );
  });
};

// GET ALL JOBS (Direct + Approved TPO jobs)
exports.getAllJobs = (req, res) => {
  const query = `
    SELECT j.*, c.company_name
    FROM jobs j
    JOIN company c ON j.company_id = c.company_id
    WHERE j.status = 'active'
    ORDER BY j.created_at DESC
  `;

  db.query(query, (err, result) => {
    if (err) return res.status(500).json(err);

    return res.status(200).json({
      total: result.length,
      jobs: result
    });
  });
};

// STUDENT - MY APPLICATIONS
exports.getMyApplications = (req, res) => {
  const student_id = req.user.user_id;

  const sql = `
    SELECT 
      a.application_id,
      a.status,
      a.applied_at,
      j.job_id,
      j.title,
      j.location,
      j.job_type,
      c.company_name
    FROM applications a
    JOIN jobs j ON a.job_id = j.job_id
    JOIN company c ON j.company_id = c.company_id
    WHERE a.student_id = ?
    ORDER BY a.applied_at DESC
  `;

  db.query(sql, [student_id], (err, result) => {
    if (err) return res.status(500).json(err);

    return res.status(200).json({
      message: "My applications fetched successfully",
      data: result
    });
  });
};