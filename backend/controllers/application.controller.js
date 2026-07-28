const db = require("../config/db");

// APPLY TO JOB
exports.applyJob = async (req, res) => {
  const user_id = req.user.user_id; // from JWT
  
  const { job_id, availability, resume_option, manual_resume_name, manual_resume_data } = req.body;

  if (!job_id) {
    return res.status(400).json({
      message: "Job ID is required"
    });
  }

  // CHANGED: Added 'try {' block here to catch errors for all the await queries below
  try {
    // Fetch the student's actual student_id first to ensure they have edited/completed their resume profile
    const studentQuery = "SELECT * FROM student WHERE user_id = ?";
    
    // CHANGED: Replaced callback with await db.promise().query() and array destructuring
    const [studentRes] = await db.promise().query(studentQuery, [user_id]);

    // DELETED: The 'if (err)' block that used to be here

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

    // CHANGED: Replaced callback with await db.promise().query(). 
    // Renamed 'result' to 'checkResult' so it doesn't conflict with the next query.
    const [checkResult] = await db.promise().query(checkQuery, [student_id, job_id]);

    // DELETED: The 'if (err)' block that used to be here

    // CHANGED: Updated 'result.length' to 'checkResult.length'
    if (checkResult.length > 0) {
      return res.status(400).json({
        message: "You already applied for this job"
      });
    }

    // Step 2: insert application with availability and resume details
    const insertQuery = `
      INSERT INTO applications (student_id, job_id, status, availability, resume_option, manual_resume_name, manual_resume_data)
      VALUES (?, ?, 'applied', ?, ?, ?, ?)
    `;

    // CHANGED: Replaced callback with await db.promise().query().
    // Renamed 'result' to 'insertResult'.
    const [insertResult] = await db.promise().query(
      insertQuery,
      [
        student_id,
        job_id,
        availability || 'Immediate',
        resume_option || 'inbuilt',
        manual_resume_name || null,
        manual_resume_data || null
      ]
    );

    // DELETED: The 'if (err)' block that used to be here

    return res.status(201).json({
      message: "Job applied successfully",
      // CHANGED: Updated 'result.insertId' to 'insertResult.insertId'
      application_id: insertResult.insertId 
    });

  // CHANGED: Replaced all the nested '});' brackets with this single catch block
  } catch (err) {
    console.error("Error in applyJob:", err);
    return res.status(500).json({ message: "Database error processing application", error: err.message });
  }
};

// CHANGED: Added 'async' keyword to the function
exports.getMyApplications = async (req, res) => {
  const user_id = req.user.user_id;

  // CHANGED: Opened a 'try {' block to catch errors for the awaits below
  try {
    const studentQuery = "SELECT student_id FROM student WHERE user_id = ?";
    
    // CHANGED: Replaced the callback with await db.promise().query() and array destructuring
    const [studentRes] = await db.promise().query(studentQuery, [user_id]);
    
    // DELETED: The 'if (err) return res.status(500).json(err);' that used to be here

    // Notice your logic right here remains exactly the same
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

    // CHANGED: Replaced the second callback with await db.promise().query()
    const [result] = await db.promise().query(sql, [student_id]);
    
    // DELETED: The 'if (err) return res.status(500).json(err);' that used to be here

    res.status(200).json(result);

  // CHANGED: Replaced the nested '});' brackets at the end with this catch block
  } catch (err) {
    console.error("Error in getMyApplications:", err);
    return res.status(500).json(err);
  }
};

// GET ALL APPLICANTS FOR A JOB (COMPANY)
// CHANGED: Added 'async' keyword to the function
exports.getApplicantsByJob = async (req, res) => {
  const job_id = req.params.job_id;
  const user_id = req.user.user_id;

  // CHANGED: Opened a 'try {' block to catch errors for the awaits below
  try {
    // Step 1: verify company owns job
    const verifyQuery = `
      SELECT j.job_id 
      FROM jobs j
      JOIN company c ON j.company_id = c.company_id
      WHERE j.job_id = ? AND c.user_id = ?
    `;

    // CHANGED: Replaced callback with await db.promise().query() and array destructuring
    const [result] = await db.promise().query(verifyQuery, [job_id, user_id]);

    // DELETED: The 'if (err) return res.status(500).json(err);' that used to be here

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

    // CHANGED: Replaced callback with await db.promise().query() and array destructuring
    const [applicants] = await db.promise().query(applicantQuery, [job_id]);
    
    // DELETED: The 'if (err) return res.status(500).json(err);' that used to be here

    return res.status(200).json({
      total: applicants.length,
      applicants
    });

  // CHANGED: Replaced the nested '});' brackets at the end with this catch block
  } catch (err) {
    console.error("Error in getApplicantsByJob:", err);
    return res.status(500).json(err);
  }
};
