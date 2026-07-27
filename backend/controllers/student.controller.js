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
// GET STUDENT PROFILE
exports.getStudentProfile = (req, res) => {
  const user_id = req.user.user_id;

  const query = `
    SELECT u.name, u.email, u.mobile_number, u.work_status,
           s.student_id, s.college_id, s.skills, s.resume_url, s.branch, s.year, s.resume_data
    FROM users u
    LEFT JOIN student s ON u.user_id = s.user_id
    WHERE u.user_id = ?
  `;

  db.query(query, [user_id], (err, results) => {
    if (err) {
      console.error("GET PROFILE ERROR:", err);
      return res.status(500).json({ message: "Failed to retrieve profile data" });
    }

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
  });
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
exports.updateProfile = (req, res) => {
  const user_id = req.user.user_id;
  const { name, mobile_number, skills, branch, year, resume_data, resume_url, work_status } = req.body;
  const parsedResumeData = safeParseJson(resume_data) || {};

  if (req.file) {
    parsedResumeData.avatar_url = `/uploads/${req.file.filename}`;
  }

  const updateUserQuery = `UPDATE users SET name = ?, mobile_number = ?, work_status = ? WHERE user_id = ?`;
  const userValues = [name || null, mobile_number || null, work_status || null, user_id];

  db.query(updateUserQuery, userValues, (userErr) => {
    if (userErr) {
      console.error('UPDATE USER PROFILE ERROR:', userErr);
      return res.status(500).json({ message: 'Failed to update user profile' });
    }

    db.query('SELECT * FROM student WHERE user_id = ?', [user_id], (selectErr, selectResult) => {
      if (selectErr) {
        console.error('SELECT STUDENT PROFILE ERROR:', selectErr);
        return res.status(500).json({ message: 'Failed to update student profile' });
      }

      const studentFields = ['branch = ?', 'year = ?', 'skills = ?', 'resume_url = ?', 'resume_data = ?'];
      const studentValues = [branch || null, year || null, skills || null, resume_url || null, JSON.stringify(parsedResumeData)];

      if (selectResult.length > 0) {
        const updateStudentQuery = `UPDATE student SET ${studentFields.join(', ')} WHERE user_id = ?`;
        studentValues.push(user_id);
        db.query(updateStudentQuery, studentValues, (studentErr) => {
          if (studentErr) {
            console.error('UPDATE STUDENT PROFILE ERROR:', studentErr);
            return res.status(500).json({ message: 'Failed to update student profile' });
          }
          return res.json({ message: 'Profile updated successfully' });
        });
      } else {
        const insertStudentQuery = `INSERT INTO student (user_id, branch, year, skills, resume_url, resume_data) VALUES (?, ?, ?, ?, ?, ?)`;
        db.query(insertStudentQuery, [user_id, branch || null, year || null, skills || null, resume_url || null, JSON.stringify(parsedResumeData)], (insertErr) => {
          if (insertErr) {
            console.error('INSERT STUDENT PROFILE ERROR:', insertErr);
            return res.status(500).json({ message: 'Failed to create student profile' });
          }
          return res.json({ message: 'Profile created successfully' });
        });
      }
    });
  });
};

// GET PREFERENCES
exports.getPreferences = (req, res) => {
  const user_id = req.user.user_id;

  db.query("SELECT preferences FROM student WHERE user_id = ?", [user_id], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.length === 0) {
      return res.json({ preferences: null });
    }

    try {
      const preferences = result[0].preferences ? JSON.parse(result[0].preferences) : null;
      return res.json({ preferences });
    } catch (e) {
      return res.json({ preferences: null });
    }
  });
};

// UPDATE PREFERENCES
exports.updatePreferences = (req, res) => {
  const user_id = req.user.user_id;
  const { preferences } = req.body;

  if (!preferences) {
    return res.status(400).json({ message: "Preferences required" });
  }

  const prefString = typeof preferences === 'string' ? preferences : JSON.stringify(preferences);

  // Check if profile exists, if not create one
  db.query("SELECT * FROM student WHERE user_id = ?", [user_id], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.length === 0) {
      // Create student profile with default values and approved status
      const insertQuery = `
        INSERT INTO student (user_id, approval_status, preferences)
        VALUES (?, 'approved', ?)
      `;
      db.query(insertQuery, [user_id, prefString], (err) => {
        if (err) return res.status(500).json(err);
        return res.json({ message: "Preferences created successfully" });
      });
    } else {
      const updateQuery = `
        UPDATE student
        SET preferences = ?
        WHERE user_id = ?
      `;
      db.query(updateQuery, [prefString, user_id], (err) => {
        if (err) return res.status(500).json(err);
        return res.json({ message: "Preferences updated successfully" });
      });
    }
  });
};

// SAVE JOB (add to preferences.savedJobs)
exports.saveJob = (req, res) => {
  const user_id = req.user.user_id;
  const jobId = req.params.jobId;

  if (!jobId) return res.status(400).json({ message: 'Job id required' });

  db.query('SELECT preferences FROM student WHERE user_id = ?', [user_id], (err, result) => {
    if (err) return res.status(500).json(err);

    let preferences = {};
    if (result.length === 0) {
      // create student row with preferences
      preferences = { savedJobs: [jobId], hiddenJobs: [] };
      const insertQuery = `INSERT INTO student (user_id, approval_status, preferences) VALUES (?, 'approved', ?)`;
      db.query(insertQuery, [user_id, JSON.stringify(preferences)], (err) => {
        if (err) return res.status(500).json(err);
        return res.json({ savedJobs: preferences.savedJobs });
      });
    } else {
      try {
        preferences = result[0].preferences ? JSON.parse(result[0].preferences) : {};
      } catch (e) {
        preferences = {};
      }

      preferences.savedJobs = preferences.savedJobs || [];
      if (!preferences.savedJobs.includes(String(jobId))) preferences.savedJobs.unshift(String(jobId));
      const updateQuery = `UPDATE student SET preferences = ? WHERE user_id = ?`;
      db.query(updateQuery, [JSON.stringify(preferences), user_id], (err) => {
        if (err) return res.status(500).json(err);
        return res.json({ savedJobs: preferences.savedJobs });
      });
    }
  });
};

// HIDE JOB (add to preferences.hiddenJobs and remove from savedJobs)
exports.hideJob = (req, res) => {
  const user_id = req.user.user_id;
  const jobId = req.params.jobId;

  if (!jobId) return res.status(400).json({ message: 'Job id required' });

  db.query('SELECT preferences FROM student WHERE user_id = ?', [user_id], (err, result) => {
    if (err) return res.status(500).json(err);

    let preferences = {};
    if (result.length === 0) {
      preferences = { savedJobs: [], hiddenJobs: [jobId] };
      const insertQuery = `INSERT INTO student (user_id, approval_status, preferences) VALUES (?, 'approved', ?)`;
      db.query(insertQuery, [user_id, JSON.stringify(preferences)], (err) => {
        if (err) return res.status(500).json(err);
        return res.json({ hiddenJobs: preferences.hiddenJobs });
      });
    } else {
      try {
        preferences = result[0].preferences ? JSON.parse(result[0].preferences) : {};
      } catch (e) {
        preferences = {};
      }

      preferences.savedJobs = preferences.savedJobs || [];
      preferences.hiddenJobs = preferences.hiddenJobs || [];
      // remove from saved if present
      preferences.savedJobs = preferences.savedJobs.filter(id => String(id) !== String(jobId));
      if (!preferences.hiddenJobs.includes(String(jobId))) preferences.hiddenJobs.unshift(String(jobId));

      const updateQuery = `UPDATE student SET preferences = ? WHERE user_id = ?`;
      db.query(updateQuery, [JSON.stringify(preferences), user_id], (err) => {
        if (err) return res.status(500).json(err);
        return res.json({ hiddenJobs: preferences.hiddenJobs });
      });
    }
  });
};

// GET SAVED JOBS
exports.getSavedJobs = (req, res) => {
  const user_id = req.user.user_id;
  db.query('SELECT preferences FROM student WHERE user_id = ?', [user_id], (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.length === 0) return res.json({ savedJobs: [] });
    try {
      const prefs = result[0].preferences ? JSON.parse(result[0].preferences) : {};
      return res.json({ savedJobs: prefs.savedJobs || [] });
    } catch (e) {
      return res.json({ savedJobs: [] });
    }
  });
};

// GET HIDDEN JOBS
exports.getHiddenJobs = (req, res) => {
  const user_id = req.user.user_id;
  db.query('SELECT preferences FROM student WHERE user_id = ?', [user_id], (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.length === 0) return res.json({ hiddenJobs: [] });
    try {
      const prefs = result[0].preferences ? JSON.parse(result[0].preferences) : {};
      return res.json({ hiddenJobs: prefs.hiddenJobs || [] });
    } catch (e) {
      return res.json({ hiddenJobs: [] });
    }
  });
};

// REMOVE SAVED JOB
exports.removeSavedJob = (req, res) => {
  const user_id = req.user.user_id;
  const jobId = req.params.jobId;
  if (!jobId) return res.status(400).json({ message: 'Job id required' });

  db.query('SELECT preferences FROM student WHERE user_id = ?', [user_id], (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.length === 0) return res.json({ savedJobs: [] });
    let preferences = {};
    try {
      preferences = result[0].preferences ? JSON.parse(result[0].preferences) : {};
    } catch (e) {
      preferences = {};
    }
    preferences.savedJobs = (preferences.savedJobs || []).filter(id => String(id) !== String(jobId));
    const updateQuery = `UPDATE student SET preferences = ? WHERE user_id = ?`;
    db.query(updateQuery, [JSON.stringify(preferences), user_id], (err) => {
      if (err) return res.status(500).json(err);
      return res.json({ savedJobs: preferences.savedJobs });
    });
  });
};