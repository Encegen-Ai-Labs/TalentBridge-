const db = require("../config/db");


// ===============================
// CREATE COMPANY PROFILE
// ===============================
exports.createCompanyProfile = (req, res) => {
  const user_id = req.user.user_id;
  const { company_name, industry } = req.body;

  if (!company_name || !industry) {
    return res.status(400).json({
      message: "Company name and industry are required"
    });
  }

  db.query(
    "SELECT * FROM company WHERE user_id = ?",
    [user_id],
    (err, result) => {
      if (err) return res.status(500).json(err);

      if (result.length) {
        return res.status(400).json({
          message: "Company already exists"
        });
      }

      db.query(
        `INSERT INTO company (user_id, company_name, industry, verified_status)
         VALUES (?, ?, ?, 0)`,
        [user_id, company_name, industry],
        (err, data) => {
          if (err) return res.status(500).json(err);

          res.status(201).json({
            message: "Company created",
            company_id: data.insertId
          });
        }
      );
    }
  );
};

// ===============================
// GET COMPANY DASHBOARD STATS
// ===============================
exports.getDashboardStats = (req, res) => {
  const user_id = req.user.user_id;

  db.query("SELECT * FROM company WHERE user_id = ?", [user_id], (err, compRes) => {
    if (err) return res.status(500).json(err);

    if (compRes.length === 0) {
      return res.json({
        company_name: "New Partner",
        totalJobs: 0,
        totalApplications: 0,
        totalInvites: 0,
        totalHirings: 0,
        recentApplicants: [],
        recentJobs: []
      });
    }

    const company = compRes[0];
    const company_id = company.company_id;

    const qJobs = "SELECT COUNT(*) AS count FROM jobs WHERE company_id = ?";
    const qApps = "SELECT COUNT(*) AS count FROM applications a JOIN jobs j ON a.job_id = j.job_id WHERE j.company_id = ?";
    const qInvites = "SELECT COUNT(*) AS count FROM campus_drive_requests WHERE company_id = ?";
    const qHirings = "SELECT COUNT(*) AS count FROM applications a JOIN jobs j ON a.job_id = j.job_id WHERE j.company_id = ? AND a.status = 'selected'";
    
    const qRecentApplicants = `
      SELECT 
        a.application_id,
        a.status,
        a.applied_at,
        j.title AS job_title,
        COALESCE(u.name, 'Candidate') AS student_name,
        COALESCE(u.email, 'Not Provided') AS student_email,
        COALESCE(s.branch, 'General') AS branch,
        COALESCE(s.year, 'N/A') AS year
      FROM applications a
      JOIN jobs j ON a.job_id = j.job_id
      LEFT JOIN users u ON a.student_id = u.user_id
      LEFT JOIN student s ON u.user_id = s.user_id OR a.student_id = s.student_id
      WHERE j.company_id = ?
      ORDER BY a.applied_at DESC
      LIMIT 5
    `;

    const qRecentJobs = `
      SELECT 
        j.job_id, 
        j.title, 
        j.job_type, 
        j.location, 
        j.status, 
        j.created_at,
        (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.job_id) AS applications_count
      FROM jobs j
      WHERE j.company_id = ?
      ORDER BY j.created_at DESC
      LIMIT 5
    `;

    db.query(qJobs, [company_id], (err, jobsRes) => {
      if (err) return res.status(500).json(err);
      
      db.query(qApps, [company_id], (err, appsRes) => {
        if (err) return res.status(500).json(err);
        
        db.query(qInvites, [company_id], (err, invitesRes) => {
          if (err) return res.status(500).json(err);
          
          db.query(qHirings, [company_id], (err, hiringsRes) => {
            if (err) return res.status(500).json(err);
            
            db.query(qRecentApplicants, [company_id], (err, recentAppsRes) => {
              if (err) return res.status(500).json(err);
              
              db.query(qRecentJobs, [company_id], (err, recentJobsRes) => {
                if (err) return res.status(500).json(err);

                res.json({
                  company_name: company.company_name,
                  totalJobs: jobsRes[0].count,
                  totalApplications: appsRes[0].count,
                  totalInvites: invitesRes[0].count,
                  totalHirings: hiringsRes[0].count,
                  recentApplicants: recentAppsRes,
                  recentJobs: recentJobsRes
                });
              });
            });
          });
        });
      });
    });
  });
};
exports.getCompanyApplicants = (req, res) => {
  const user_id = req.user.user_id;

  const query = `
    SELECT 
      a.application_id,
      a.status,
      a.applied_at,

      j.job_id,
      j.title AS job_title,

      COALESCE(s.student_id, 0) AS student_id,
      COALESCE(s.branch, 'General') AS branch,
      COALESCE(s.year, 'N/A') AS year,
      COALESCE(s.skills, '') AS skills,

      COALESCE(u.name, 'Candidate') AS name,
      COALESCE(u.email, 'Not Provided') AS email

    FROM applications a
    JOIN jobs j ON a.job_id = j.job_id
    LEFT JOIN users u ON a.student_id = u.user_id
    LEFT JOIN student s ON u.user_id = s.user_id OR a.student_id = s.student_id
    JOIN company c ON j.company_id = c.company_id

    WHERE c.user_id = ?
    ORDER BY a.applied_at DESC
  `;

  db.query(query, [user_id], (err, result) => {
    if (err) return res.status(500).json(err);

    res.json({
      message: "Applicants fetched successfully",
      data: result
    });
  });
};

exports.updateApplicationStatus = (req, res) => {
  const application_id = req.params.application_id;
  const { status } = req.body;
  const user_id = req.user.user_id;

  const allowed = ["shortlisted", "rejected", "selected"];

  if (!allowed.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const query = `
    SELECT a.*, j.company_id
    FROM applications a
    JOIN jobs j ON a.job_id = j.job_id
    JOIN company c ON j.company_id = c.company_id
    WHERE a.application_id = ? AND c.user_id = ?
  `;

  db.query(query, [application_id, user_id], (err, result) => {
    if (err) return res.status(500).json(err);

    if (!result.length) {
      return res.status(403).json({ message: "Not authorized" });
    }

    db.query(
      `UPDATE applications SET status = ? WHERE application_id = ?`,
      [status, application_id],
      (err) => {
        if (err) return res.status(500).json(err);

        res.json({ message: `Status updated to ${status}` });
      }
    );
  });
};

// ===============================
// GET COMPANY INVITES
// ===============================
exports.getCompanyInvites = (req, res) => {
  const user_id = req.user.user_id;

  db.query(
    "SELECT company_id FROM company WHERE user_id = ?",
    [user_id],
    (err, result) => {
      if (err) return res.status(500).json(err);

      if (!result.length) {
        return res.status(404).json({ message: "Company not found" });
      }

      const company_id = result[0].company_id;

      db.query(
        `SELECT r.*, c.college_name
         FROM campus_drive_requests r
         JOIN college c ON r.college_id = c.college_id
         WHERE r.company_id = ?
         ORDER BY r.request_id DESC`,
        [company_id],
        (err, data) => {
          if (err) return res.status(500).json(err);

          res.json(data);
        }
      );
    }
  );
};


// ===============================
// ACCEPT INVITE
// ===============================
exports.acceptInvite = (req, res) => {
  const { request_id } = req.body;
  const user_id = req.user.user_id;

  db.query(
    `SELECT c.company_id 
     FROM company c
     JOIN campus_drive_requests r ON r.company_id = c.company_id
     WHERE r.request_id = ? AND c.user_id = ?`,
    [request_id, user_id],
    (err, result) => {
      if (err) return res.status(500).json(err);

      if (!result.length) {
        return res.status(403).json({ message: "Not authorized" });
      }

      db.query(
        `UPDATE campus_drive_requests 
         SET status = 'accepted'
         WHERE request_id = ? AND status = 'pending'`,
        [request_id],
        (err, data) => {
          if (err) return res.status(500).json(err);

          res.json({ message: "Invite accepted" });
        }
      );
    }
  );
};


// ===============================
// REJECT INVITE
// ===============================
exports.rejectInvite = (req, res) => {
  const { request_id } = req.body;

  db.query(
    `UPDATE campus_drive_requests 
     SET status = 'rejected'
     WHERE request_id = ?`,
    [request_id],
    (err, data) => {
      if (err) return res.status(500).json(err);

      res.json({ message: "Invite rejected" });
    }
  );
};

// ===============================
// CREATE JOB FROM DRIVE
// ===============================
exports.createJobFromDrive = (req, res) => {
  const user_id = req.user.user_id;
  const { drive_id, title, description, skills } = req.body;

  // get company
  db.query("SELECT * FROM company WHERE user_id = ?", [user_id], (err, compRes) => {
    const company = compRes[0];

    const query = `
      INSERT INTO jobs
      (company_id, title, description, skills_required, job_mode, drive_id, status)
      VALUES (?, ?, ?, ?, 'TPO', ?, 'active')
    `;

    db.query(query, [company.company_id, title, description, skills, drive_id], (err, result) => {
      if (err) return res.status(500).json(err);

      res.json({
        message: "Job created for drive",
        job_id: result.insertId
      });
    });
  });
};

