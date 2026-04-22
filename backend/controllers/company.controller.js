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
exports.getCompanyApplicants = (req, res) => {
  const user_id = req.user.user_id;

  const query = `
    SELECT 
      a.application_id,
      a.status,
      a.applied_at,

      j.job_id,
      j.title AS job_title,

      s.student_id,
      s.branch,
      s.year,
      s.skills,

      u.name,
      u.email

    FROM applications a
    JOIN jobs j ON a.job_id = j.job_id
    JOIN student s ON a.student_id = s.user_id
    JOIN users u ON s.user_id = u.user_id
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