const db = require("../config/db");

// CREATE COMPANY PROFILE
exports.createCompanyProfile = (req, res) => {
  const user_id = req.user.user_id;
  const { company_name, industry } = req.body;

  if (!company_name || !industry) {
    return res.status(400).json({
      message: "Company name and industry are required"
    });
  }

  // Check if company already exists
  const checkQuery = "SELECT * FROM company WHERE user_id = ?";

  db.query(checkQuery, [user_id], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.length > 0) {
      return res.status(400).json({
        message: "Company profile already exists"
      });
    }

    // Insert company profile
    const insertQuery = `
      INSERT INTO company (user_id, company_name, industry, verified_status)
      VALUES (?, ?, ?, ?)
    `;

    db.query(
      insertQuery,
      [user_id, company_name, industry, false],
      (err, result) => {
        if (err) return res.status(500).json(err);

        return res.status(201).json({
          message: "Company profile created successfully",
          company_id: result.insertId
        });
      }
    );
  });
};

exports.getCompanyApplicants = (req, res) => {
  const company_id = req.user.user_id;

  const sql = `
    SELECT 
      a.application_id,
      a.status,
      a.applied_at,

      s.student_id,
      s.skills,
      s.branch,
      s.year,

      u.name AS student_name,
      u.email,

      j.job_id,
      j.title

    FROM applications a
    JOIN student s ON a.student_id = s.user_id
    JOIN users u ON s.user_id = u.user_id
    JOIN jobs j ON a.job_id = j.job_id
    JOIN company c ON j.company_id = c.company_id

    WHERE c.user_id = ?
    ORDER BY a.applied_at DESC
  `;

  db.query(sql, [company_id], (err, result) => {
    if (err) return res.status(500).json(err);

    return res.status(200).json({
      message: "Company applicants fetched successfully",
      data: result
    });
  });
};

// UPDATE APPLICATION STATUS (COMPANY ONLY)
exports.updateApplicationStatus = (req, res) => {
  const application_id = req.params.application_id;
  const { status } = req.body;
  const user_id = req.user.user_id;

  const allowedStatus = ["shortlisted", "rejected", "selected"];

  if (!allowedStatus.includes(status)) {
    return res.status(400).json({
      message: "Invalid status"
    });
  }

  // Step 1: Check if application exists + get job
  const query = `
    SELECT a.*, j.company_id 
    FROM applications a
    JOIN jobs j ON a.job_id = j.job_id
    WHERE a.application_id = ?
  `;

  db.query(query, [application_id], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.length === 0) {
      return res.status(404).json({
        message: "Application not found"
      });
    }

    const application = result[0];

    // Step 2: Check if company owns this job
    const companyQuery = `
      SELECT * FROM company WHERE user_id = ? AND company_id = ?
    `;

    db.query(companyQuery, [user_id, application.company_id], (err, company) => {
      if (err) return res.status(500).json(err);

      if (company.length === 0) {
        return res.status(403).json({
          message: "Not authorized"
        });
      }

      // Step 3: Update status
      const updateQuery = `
        UPDATE applications 
        SET status = ?
        WHERE application_id = ?
      `;

      db.query(updateQuery, [status, application_id], (err, result) => {
        if (err) return res.status(500).json(err);

        return res.json({
          message: `Application marked as ${status}`
        });
      });
    });
  });
};