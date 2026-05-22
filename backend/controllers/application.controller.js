const db = require("../config/db");

// APPLY TO JOB
exports.applyJob = (req, res) => {
  const user_id = req.user.user_id; // from JWT
  const { job_id, availability, resume_option, manual_resume_name, manual_resume_data } = req.body;

  if (!job_id) {
    return res.status(400).json({
      message: "Job ID is required"
    });
  }

  // Fetch the student's actual student_id first to ensure they have edited/completed their resume profile
  const studentQuery = "SELECT * FROM student WHERE user_id = ?";
  db.query(studentQuery, [user_id], (err, studentRes) => {
    if (err) {
      console.error("Error fetching student profile:", err);
      return res.status(500).json({ message: "Database error fetching student profile", error: err.message });
    }

    if (studentRes.length === 0 || !studentRes[0].resume_data) {
      return res.status(400).json({
        message: "Resume profile not found or incomplete. Please complete editing your resume first."
      });
    }

    const student = studentRes[0];
    const student_id = student.student_id;

    // Step 1: check if already applied
    const checkQuery = `
      SELECT * FROM applications 
      WHERE student_id = ? AND job_id = ?
    `;

    db.query(checkQuery, [student_id, job_id], (err, result) => {
      if (err) {
        console.error("Error checking duplicate application:", err);
        return res.status(500).json({ message: "Database error checking existing applications", error: err.message });
      }

      if (result.length > 0) {
        return res.status(400).json({
          message: "You already applied for this job"
        });
      }

      // Step 2: insert application with availability and resume details
      const insertQuery = `
        INSERT INTO applications (student_id, job_id, status, availability, resume_option, manual_resume_name, manual_resume_data)
        VALUES (?, ?, 'applied', ?, ?, ?, ?)
      `;

      db.query(
        insertQuery,
        [
          student_id,
          job_id,
          availability || 'Immediate',
          resume_option || 'inbuilt',
          manual_resume_name || null,
          manual_resume_data || null
        ],
        (err, result) => {
          if (err) {
            console.error("Error inserting application:", err);
            return res.status(500).json({ message: "Database error inserting application", error: err.message });
          }

          return res.status(201).json({
            message: "Job applied successfully",
            application_id: result.insertId
          });
        }
      );
    });
  });
};

exports.getMyApplications = (req, res) => {
  const user_id = req.user.user_id;

  const studentQuery = "SELECT student_id FROM student WHERE user_id = ?";
  db.query(studentQuery, [user_id], (err, studentRes) => {
    if (err) return res.status(500).json(err);

    if (studentRes.length === 0) {
      return res.status(200).json([]);
    }

    const student_id = studentRes[0].student_id;

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
      ORDER BY a.applied_at DESC
    `;

    db.query(sql, [student_id], (err, result) => {
      if (err) return res.status(500).json(err);
      res.status(200).json(result);
    });
  });
};

// GET ALL APPLICANTS FOR A JOB (COMPANY)
exports.getApplicantsByJob = (req, res) => {
  const job_id = req.params.job_id;
  const user_id = req.user.user_id;

  // Step 1: verify company owns job
  const verifyQuery = `
    SELECT j.job_id 
    FROM jobs j
    JOIN company c ON j.company_id = c.company_id
    WHERE j.job_id = ? AND c.user_id = ?
  `;

  db.query(verifyQuery, [job_id, user_id], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.length === 0) {
      return res.status(403).json({
        message: "Unauthorized access"
      });
    }

    // Step 2: fetch applicants
    const applicantQuery = `
      SELECT 
        a.application_id,
        a.status,
        a.applied_at,
        a.availability,
        a.resume_option,
        a.manual_resume_name,
        a.manual_resume_data,
        s.student_id,
        u.name,
        s.skills,
        s.branch,
        s.year
      FROM applications a
      JOIN student s ON a.student_id = s.student_id
      JOIN users u ON s.user_id = u.user_id
      WHERE a.job_id = ?
      ORDER BY a.applied_at DESC
    `;


    db.query(applicantQuery, [job_id], (err, applicants) => {
      if (err) return res.status(500).json(err);

      return res.status(200).json({
        total: applicants.length,
        applicants
      });
    });
  });
};
// ===============================
// SHARED JOBS
// ===============================

exports.applySharedJob = (req, res) => {
  const user_id = req.user.user_id;
  const { job_id } = req.body;

  if (!job_id) {
    return res.status(400).json({ message: "Job ID required" });
  }

  const checkQuery = `
    SELECT * FROM student
    WHERE user_id = ?
    AND approval_status = 'approved'
  `;

  db.query(checkQuery, [user_id], (err, result) => {
    if (err) return res.status(500).json(err);

    // ❌ no student found
    if (result.length === 0) {
      return res.status(403).json({
        message: "You are not approved by TPO"
      });
    }

    // ✅ FIX: define student
    const student = result[0];

    // OPTIONAL: check if job shared
    const sharedQuery = `
      SELECT * FROM tpo_shared_jobs
      WHERE job_id = ?
      AND college_id = ?
    `;

    db.query(sharedQuery, [job_id, student.college_id], (err, sharedRes) => {
      if (err) return res.status(500).json(err);

      if (sharedRes.length === 0) {
        return res.status(403).json({
          message: "Job not shared for your college"
        });
      }

      // check duplicate apply
      const checkApply = `
        SELECT * FROM applications
        WHERE student_id = ? AND job_id = ?
      `;

      db.query(checkApply, [student.student_id, job_id], (err, exist) => {
        if (exist.length > 0) {
          return res.status(400).json({
            message: "Already applied"
          });
        }

        // ✅ insert
        const insertQuery = `
          INSERT INTO applications (student_id, job_id, status)
          VALUES (?, ?, 'applied')
        `;

        db.query(insertQuery, [student.student_id, job_id], (err, result) => {
          if (err) return res.status(500).json(err);

          res.json({
            message: "Applied successfully",
            application_id: result.insertId
          });
        });
      });
    });
  });
};