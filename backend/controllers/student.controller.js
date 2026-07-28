const db = require("../config/db");

// CREATE STUDENT PROFILE
exports.createStudentProfile = async (req, res) => {
  const user_id = req.user.user_id;
  const { skills, branch, year, college_id } = req.body;

  if (!skills || !branch || !year) {
    return res.status(400).json({
      message: "Skills, branch, and year are required"
    });
  }

  try {
    // Check if profile already exists
    const checkQuery = "SELECT * FROM student WHERE user_id = ?";
    const [result] = await db.promise().query(checkQuery, [user_id]);

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

    const [insertResult] = await db.promise().query(
      insertQuery,
      [user_id, college_id || null, skills, branch, year]
    );

    return res.status(201).json({
      message: "Student profile created successfully",
      student_id: insertResult.insertId
    });

  } catch (err) {
    return res.status(500).json(err);
  }
};
// GET STUDENT PROFILE
exports.getStudentProfile = async (req, res) => {
  const user_id = req.user.user_id;

  const query = `
    SELECT u.name, u.email, u.mobile_number, u.work_status,
           s.student_id, s.college_id, s.skills, s.resume_url, s.branch, s.year, s.resume_data
    FROM users u
    LEFT JOIN student s ON u.user_id = s.user_id
    WHERE u.user_id = ?
  `;

  try {
    const [results] = await db.promise().query(query, [user_id]);

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const row = results[0];
    let resumeData = null;
    if (row.resume_data) {
      try {
        resumeData = JSON.parse(row.resume_data);
      } catch (e) {
        console.error("JSON PARSE ERROR on resume_data:", e);
      }
    }

    return res.json({
      user: {
        name: row.name,
        email: row.email,
        mobile_number: row.mobile_number,
        work_status: row.work_status
      },
      profile: {
        student_id: row.student_id,
        college_id: row.college_id,
        skills: row.skills,
        resume_url: row.resume_url,
        branch: row.branch,
        year: row.year,
        resume_data: resumeData
      }
    });

  } catch (err) {
    console.error("GET PROFILE ERROR:", err);
    return res.status(500).json({ message: "Failed to retrieve profile data" });
  }
};

function safeParseJson(value) {
  if (!value) return null;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
}
// UPDATE STUDENT PROFILE
exports.updateProfile = async (req, res) => {
  const user_id = req.user.user_id;
  const { name, mobile_number, skills, branch, year, resume_data, resume_url, work_status } = req.body;
  const parsedResumeData = safeParseJson(resume_data) || {};

  if (req.file) {
    parsedResumeData.avatar_url = `/uploads/${req.file.filename}`;
  }

  const updateUserQuery = `UPDATE users SET name = ?, mobile_number = ?, work_status = ? WHERE user_id = ?`;
  const userValues = [name || null, mobile_number || null, work_status || null, user_id];

  try {
    await db.promise().query(updateUserQuery, userValues);

    const [selectResult] = await db.promise().query(
      'SELECT * FROM student WHERE user_id = ?',
      [user_id]
    );

    const studentFields = ['branch = ?', 'year = ?', 'skills = ?', 'resume_url = ?', 'resume_data = ?'];
    const studentValues = [branch || null, year || null, skills || null, resume_url || null, JSON.stringify(parsedResumeData)];

    if (selectResult.length > 0) {
      const updateStudentQuery = `UPDATE student SET ${studentFields.join(', ')} WHERE user_id = ?`;
      studentValues.push(user_id);
      await db.promise().query(updateStudentQuery, studentValues);
      return res.json({ message: 'Profile updated successfully' });
    } else {
      const insertStudentQuery = `INSERT INTO student (user_id, branch, year, skills, resume_url, resume_data) VALUES (?, ?, ?, ?, ?, ?)`;
      await db.promise().query(insertStudentQuery, [user_id, branch || null, year || null, skills || null, resume_url || null, JSON.stringify(parsedResumeData)]);
      return res.json({ message: 'Profile created successfully' });
    }

  } catch (err) {
    console.error('UPDATE STUDENT PROFILE ERROR:', err);
    return res.status(500).json({ message: 'Failed to update student profile' });
  }
};
// GET PREFERENCES
exports.getPreferences = async (req, res) => {
  const user_id = req.user.user_id;

  try {
    const [result] = await db.promise().query(
      "SELECT preferences FROM student WHERE user_id = ?",
      [user_id]
    );

    if (result.length === 0) {
      return res.json({ preferences: null });
    }

    try {
      const preferences = result[0].preferences ? JSON.parse(result[0].preferences) : null;
      return res.json({ preferences });
    } catch (e) {
      return res.json({ preferences: null });
    }

  } catch (err) {
    return res.status(500).json(err);
  }
};
// UPDATE PREFERENCES
exports.updatePreferences = async (req, res) => {
  const user_id = req.user.user_id;
  const { preferences } = req.body;

  if (!preferences) {
    return res.status(400).json({ message: "Preferences required" });
  }

  const prefString = typeof preferences === 'string' ? preferences : JSON.stringify(preferences);

  try {
    const [result] = await db.promise().query(
      "SELECT * FROM student WHERE user_id = ?",
      [user_id]
    );

    if (result.length === 0) {
      const insertQuery = `
        INSERT INTO student (user_id, approval_status, preferences)
        VALUES (?, 'approved', ?)
      `;
      await db.promise().query(insertQuery, [user_id, prefString]);
      return res.json({ message: "Preferences created successfully" });
    } else {
      const updateQuery = `
        UPDATE student
        SET preferences = ?
        WHERE user_id = ?
      `;
      await db.promise().query(updateQuery, [prefString, user_id]);
      return res.json({ message: "Preferences updated successfully" });
    }

  } catch (err) {
    return res.status(500).json(err);
  }
};

// SAVE JOB (add to preferences.savedJobs)
exports.saveJob = async (req, res) => {
  const user_id = req.user.user_id;
  const jobId = req.params.jobId;

  if (!jobId) return res.status(400).json({ message: 'Job id required' });

  try {
    const [result] = await db.promise().query(
      'SELECT preferences FROM student WHERE user_id = ?',
      [user_id]
    );

    let preferences = {};

    if (result.length === 0) {
      preferences = { savedJobs: [jobId], hiddenJobs: [] };
      const insertQuery = `INSERT INTO student (user_id, approval_status, preferences) VALUES (?, 'approved', ?)`;
      await db.promise().query(insertQuery, [user_id, JSON.stringify(preferences)]);
      return res.json({ savedJobs: preferences.savedJobs });
    } else {
      try {
        preferences = result[0].preferences ? JSON.parse(result[0].preferences) : {};
      } catch (e) {
        preferences = {};
      }

      preferences.savedJobs = preferences.savedJobs || [];
      if (!preferences.savedJobs.includes(String(jobId))) preferences.savedJobs.unshift(String(jobId));
      const updateQuery = `UPDATE student SET preferences = ? WHERE user_id = ?`;
      await db.promise().query(updateQuery, [JSON.stringify(preferences), user_id]);
      return res.json({ savedJobs: preferences.savedJobs });
    }

  } catch (err) {
    return res.status(500).json(err);
  }
};

// HIDE JOB (add to preferences.hiddenJobs and remove from savedJobs)
exports.hideJob = async (req, res) => {
  const user_id = req.user.user_id;
  const jobId = req.params.jobId;

  if (!jobId) return res.status(400).json({ message: 'Job id required' });

  try {
    const [result] = await db.promise().query(
      'SELECT preferences FROM student WHERE user_id = ?',
      [user_id]
    );

    let preferences = {};

    if (result.length === 0) {
      preferences = { savedJobs: [], hiddenJobs: [jobId] };
      const insertQuery = `INSERT INTO student (user_id, approval_status, preferences) VALUES (?, 'approved', ?)`;
      await db.promise().query(insertQuery, [user_id, JSON.stringify(preferences)]);
      return res.json({ hiddenJobs: preferences.hiddenJobs });
    } else {
      try {
        preferences = result[0].preferences ? JSON.parse(result[0].preferences) : {};
      } catch (e) {
        preferences = {};
      }

      preferences.savedJobs = preferences.savedJobs || [];
      preferences.hiddenJobs = preferences.hiddenJobs || [];
      preferences.savedJobs = preferences.savedJobs.filter(id => String(id) !== String(jobId));
      if (!preferences.hiddenJobs.includes(String(jobId))) preferences.hiddenJobs.unshift(String(jobId));

      const updateQuery = `UPDATE student SET preferences = ? WHERE user_id = ?`;
      await db.promise().query(updateQuery, [JSON.stringify(preferences), user_id]);
      return res.json({ hiddenJobs: preferences.hiddenJobs });
    }

  } catch (err) {
    return res.status(500).json(err);
  }
};

// GET SAVED JOBS
exports.getSavedJobs = async (req, res) => {
  const user_id = req.user.user_id;

  try {
    const [result] = await db.promise().query(
      'SELECT preferences FROM student WHERE user_id = ?',
      [user_id]
    );

    if (result.length === 0) return res.json({ savedJobs: [] });

    try {
      const prefs = result[0].preferences ? JSON.parse(result[0].preferences) : {};
      return res.json({ savedJobs: prefs.savedJobs || [] });
    } catch (e) {
      return res.json({ savedJobs: [] });
    }

  } catch (err) {
    return res.status(500).json(err);
  }
};

// GET HIDDEN JOBS
exports.getHiddenJobs = async (req, res) => {
  const user_id = req.user.user_id;

  try {
    const [result] = await db.promise().query(
      'SELECT preferences FROM student WHERE user_id = ?',
      [user_id]
    );

    if (result.length === 0) return res.json({ hiddenJobs: [] });

    try {
      const prefs = result[0].preferences ? JSON.parse(result[0].preferences) : {};
      return res.json({ hiddenJobs: prefs.hiddenJobs || [] });
    } catch (e) {
      return res.json({ hiddenJobs: [] });
    }

  } catch (err) {
    return res.status(500).json(err);
  }
};

// REMOVE SAVED JOB
exports.removeSavedJob = async (req, res) => {
  const user_id = req.user.user_id;
  const jobId = req.params.jobId;

  if (!jobId) return res.status(400).json({ message: 'Job id required' });

  try {
    const [result] = await db.promise().query(
      'SELECT preferences FROM student WHERE user_id = ?',
      [user_id]
    );

    if (result.length === 0) return res.json({ savedJobs: [] });

    let preferences = {};
    try {
      preferences = result[0].preferences ? JSON.parse(result[0].preferences) : {};
    } catch (e) {
      preferences = {};
    }

    preferences.savedJobs = (preferences.savedJobs || []).filter(id => String(id) !== String(jobId));

    const updateQuery = `UPDATE student SET preferences = ? WHERE user_id = ?`;
    await db.promise().query(updateQuery, [JSON.stringify(preferences), user_id]);
    return res.json({ savedJobs: preferences.savedJobs });

  } catch (err) {
    return res.status(500).json(err);
  }
};