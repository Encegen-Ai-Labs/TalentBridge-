const db = require("../config/db");


// ===============================
// CREATE TPO PROFILE
// ===============================
exports.createTPOProfile = (req, res) => {
  const user_id = req.user.user_id;
  const { college_id } = req.body;

  if (!college_id) {
    return res.status(400).json({ message: "College ID is required" });
  }

  // validate college
  db.query(
    "SELECT * FROM college WHERE college_id = ?",
    [college_id],
    (err, college) => {
      if (err) return res.status(500).json(err);

      if (!college.length) {
        return res.status(404).json({ message: "College not found" });
      }

      db.query(
        "SELECT * FROM tpo WHERE user_id = ?",
        [user_id],
        (err, result) => {
          if (err) return res.status(500).json(err);

          if (result.length) {
            return res.status(400).json({ message: "TPO already exists" });
          }

          db.query(
            "INSERT INTO tpo (user_id, college_id) VALUES (?, ?)",
            [user_id, college_id],
            (err, data) => {
              if (err) return res.status(500).json(err);

              res.status(201).json({
                message: "TPO profile created successfully",
                tpo_id: data.insertId
              });
            }
          );
        }
      );
    }
  );
};


// ===============================
// UPDATE JOB APPROVAL
// ===============================
exports.updateJobApproval = (req, res) => {
  const { status } = req.body;
  const approval_id = req.params.id;

  const visibility = status === "approved" ? 1 : 0;

  db.query(
    `UPDATE job_approval SET status = ?, visibility_flag = ? WHERE approval_id = ?`,
    [status, visibility, approval_id],
    (err, result) => {
      if (err) return res.status(500).json(err);

      if (!result.affectedRows) {
        return res.status(404).json({ message: "Approval not found" });
      }

      res.json({ message: `Job ${status}` });
    }
  );
};


// ===============================
// SHARE JOB
// ===============================
exports.shareJobToStudents = (req, res) => {
  const { job_id, branches, deadline } = req.body;
  const tpo_id = req.tpo.tpo_id;
  const college_id = req.tpo.college_id;

  if (!job_id) {
    return res.status(400).json({ message: "job_id required" });
  }

  // STEP 1: insert shared job
  const insertQuery = `
    INSERT INTO tpo_shared_jobs (job_id, tpo_id, college_id, deadline, status)
    VALUES (?, ?, ?, ?, 'active')
  `;

  db.query(insertQuery, [job_id, tpo_id, college_id, deadline], (err, result) => {
    if (err) return res.status(500).json(err);

    const shared_job_id = result.insertId;

    // STEP 2: insert branches
    if (branches && branches.length > 0) {

      const values = branches.map(b => [shared_job_id, b]);

      const branchQuery = `
        INSERT INTO shared_job_branches (shared_job_id, branch)
        VALUES ?
      `;

      db.query(branchQuery, [values], (err) => {
        if (err) return res.status(500).json(err);

        res.json({
          message: "Job shared with branches",
          shared_job_id
        });
      });

    } else {
      res.json({
        message: "Job shared",
        shared_job_id
      });
    }
  });
};
// ===============================
// DASHBOARD
// ===============================
exports.getDashboard = (req, res) => {
  const { college_id } = req.tpo;

  const query = `
    SELECT 
      (SELECT COUNT(*) FROM student WHERE college_id = ?) AS total_students,
      (SELECT COUNT(*) FROM applications a 
        JOIN student s ON a.student_id = s.student_id 
        WHERE s.college_id = ?) AS total_applications,
      (SELECT COUNT(*) FROM placements p 
        JOIN student s ON p.student_id = s.student_id 
        WHERE s.college_id = ?) AS total_placed
  `;

  db.query(query, [college_id, college_id, college_id], (err, data) => {
    if (err) return res.status(500).json(err);
    res.json(data[0]);
  });
};


// ===============================
// ONGOING PROCESSES
// ===============================
exports.getOngoingProcesses = (req, res) => {
  const { college_id } = req.tpo;

  const query = `
    SELECT j.title, c.company_name, COUNT(a.application_id) AS total_applicants
    FROM jobs j
    JOIN company c ON j.company_id = c.company_id
    JOIN applications a ON j.job_id = a.job_id
    JOIN student s ON a.student_id = s.student_id
    WHERE s.college_id = ? AND j.status = 'active'
    GROUP BY j.job_id
  `;

  db.query(query, [college_id], (err, data) => {
    if (err) return res.status(500).json(err);
    res.json(data);
  });
};                                                    


// ===============================
// INVITE COMPANY
// ===============================
exports.inviteCompany = (req, res) => {
  const { company_id, message } = req.body;
  const { tpo_id, college_id } = req.tpo;

  db.query(
    `INSERT INTO campus_drive_requests 
     (tpo_id, company_id, college_id, message)
     VALUES (?, ?, ?, ?)`,
    [tpo_id, company_id, college_id, message],
    (err, result) => {
      if (err) return res.status(500).json(err);

      res.json({
        message: "Invitation sent successfully",
        request_id: result.insertId
      });
    }
  );
};


// ===============================
// CREATE DRIVE FROM REQUEST
// ===============================
exports.createDriveFromRequest = (req, res) => {
  const { request_id } = req.body;

  db.query(
    `SELECT * FROM campus_drive_requests 
     WHERE request_id = ? AND status = 'accepted'`,
    [request_id],
    (err, result) => {
      if (err) return res.status(500).json(err);

      if (!result.length) {
        return res.status(400).json({
          message: "Request not accepted or not found"
        });
      }

      const r = result[0];

      db.query(
        `INSERT INTO campus_drives 
         (request_id, company_id, college_id, status)
         VALUES (?, ?, ?, 'draft')`,
        [r.request_id, r.company_id, r.college_id],
        (err, data) => {
          if (err) return res.status(500).json(err);

          res.json({
            message: "Draft drive created",
            drive_id: data.insertId
          });
        }
      );
    }
  );
};

// ===============================
// GET PENDING STUDENTS
// ===============================
exports.getPendingStudents = (req, res) => {
  const college_id = req.tpo.college_id;

  const query = `
    SELECT s.student_id, u.name, u.email, s.branch, s.year
    FROM student s
    JOIN users u ON s.user_id = u.user_id
    WHERE s.college_id = ? 
    AND s.approval_status = 'pending'
  `;

  db.query(query, [college_id], (err, result) => {
    if (err) return res.status(500).json(err);

    res.json(result);
  });
};

exports.approveStudent = (req, res) => {
  const { student_id, status } = req.body; // approved / rejected
  const college_id = req.tpo.college_id;

  const query = `
    UPDATE student
    SET approval_status = ?
    WHERE student_id = ?
    AND college_id = ?
  `;

  db.query(query, [status, student_id, college_id], (err) => {
    if (err) return res.status(500).json(err);

    res.json({ message: `Student ${status}` });
  });
};

exports.bulkApproveStudents = (req, res) => {
  const { student_ids, status } = req.body; // array
  const college_id = req.tpo.college_id;

  if (!student_ids || student_ids.length === 0) {
    return res.status(400).json({ message: "No students selected" });
  }

  const query = `
    UPDATE student
    SET approval_status = ?
    WHERE student_id IN (?)
    AND college_id = ?
  `;

  db.query(query, [status, student_ids, college_id], (err) => {
    if (err) return res.status(500).json(err);

    res.json({ message: `Students ${status} successfully` });
  });
};


// ===============================
// UPDATE DRIVE DETAILS
// ===============================
exports.updateDriveDetails = (req, res) => {
  const { drive_id, drive_date, mode } = req.body;

  if (!drive_id || !drive_date || !mode) {
    return res.status(400).json({ message: "Missing fields" });
  }

  db.query(
    `UPDATE campus_drives 
     SET drive_date = ?, mode = ?, status = 'scheduled'
     WHERE drive_id = ?`,
    [drive_date, mode, drive_id],
    (err, result) => {
      if (err) return res.status(500).json(err);

      if (!result.affectedRows) {
        return res.status(404).json({ message: "Drive not found" });
      }

      res.json({ message: "Drive scheduled successfully" });
    }
  );
};
//create discussion
exports.createDiscussion = (req, res) => {
  const {
    request_id,
    company_id,
    role,
    openings,
    branches,   // array
    stipend,
    salary,
    job_type,
    notes
  } = req.body;

  const tpo_id = req.tpo.tpo_id;

  const query = `
    INSERT INTO drive_discussions
    (request_id, company_id, tpo_id, role, openings, stipend, salary, job_type, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [request_id, company_id, tpo_id, role, openings, stipend || null, salary || null, job_type, notes],
    (err, result) => {
      if (err) return res.status(500).json(err);

      const discussion_id = result.insertId;

      // 👉 INSERT MULTIPLE BRANCHES
      if (branches && branches.length > 0) {

        const branchValues = branches.map(b => [discussion_id, b]);

        const branchQuery = `
          INSERT INTO discussion_branches (discussion_id, branch)
          VALUES ?
        `;

        db.query(branchQuery, [branchValues], (err) => {
          if (err) return res.status(500).json(err);

          res.json({
            message: "Discussion created with branches",
            discussion_id
          });
        });

      } else {
        res.json({
          message: "Discussion created",
          discussion_id
        });
      }
    }
  );
};