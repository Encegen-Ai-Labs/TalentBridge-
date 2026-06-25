// controllers/job.controller.js
const db = require("../config/db");

// ===============================
// CREATE JOB
// ===============================
exports.createJob = (req, res) => {
  const user_id = req.user.user_id;
  console.log('Creating job for user:', user_id);

  const {
    title,
    company_name,
    salary_min,
    salary_max,
    experience_min,
    experience_max,
    description,
    skills_required,
    job_type,
    location,
    job_mode,
    department,
    application_deadline,
    is_featured,
    benefits,
    education_requirements,
    preferred_candidate,
    status = 'active'
  } = req.body;

  // Validate required fields
  if (!title || !description) {
    return res.status(400).json({
      message: "Job title and description are required"
    });
  }

  // Get company details
  db.query(
    "SELECT company_id, company_name FROM company WHERE user_id = ?",
    [user_id],
    (err, companyResult) => {
      if (err) {
        console.error("Error fetching company:", err);
        return res.status(500).json({ 
          message: "Error fetching company details",
          error: err.message 
        });
      }
      
      if (!companyResult.length) {
        return res.status(404).json({ 
          message: "Company profile not found" 
        });
      }

      const company_id = companyResult[0].company_id;

      // Insert job with only essential fields
      const insertQuery = `
        INSERT INTO jobs (
          company_id,
          company_name,
          title,
          description,
          skills_required,
          job_type,
          location,
          salary_min,
          salary_max,
          experience_min,
          experience_max,
          job_mode,
          department,
          application_deadline,
          is_featured,
          benefits,
          education_requirements,
          preferred_candidate,
          status,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;

      const values = [
        company_id,
        company_name || companyResult[0].company_name,
        title,
        description,
        skills_required || null,
        job_type || 'full-time',
        location || null,
        salary_min || null,
        salary_max || null,
        experience_min || null,
        experience_max || null,
        job_mode || 'onsite',
        department || null,
        application_deadline || null,
        is_featured ? 1 : 0,
        benefits || null,
        education_requirements || null,
        preferred_candidate || null,
        status || 'active'
      ];

      db.query(insertQuery, values, (err, result) => {
        if (err) {
          console.error("Error creating job:", err);
          return res.status(500).json({ 
            message: "Error creating job posting",
            error: err.message 
          });
        }

        res.status(201).json({
          message: "Job posted successfully",
          job_id: result.insertId
        });
      });
    }
  );
};


// ===============================
// GET ALL JOBS WITH FILTERS
// ===============================
exports.getAllJobs = (req, res) => {
  const {
    search,
    location,
    job_type,
    experience_level,
    salary_min,
    salary_max,
    job_mode,
    status = 'active',
    page = 1,
    limit = 20
  } = req.query;

  let query = `
    SELECT 
      j.*,
      c.company_name,
      c.company_logo,
      c.industry,
      c.location as company_location,
      (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.job_id) as applications_count
    FROM jobs j
    LEFT JOIN company c ON j.company_id = c.company_id
    WHERE j.status = ?
  `;

  const queryParams = [status];
  let conditions = [];

  if (search) {
    conditions.push("(j.title LIKE ? OR j.description LIKE ? OR j.skills_required LIKE ?)");
    const searchTerm = `%${search}%`;
    queryParams.push(searchTerm, searchTerm, searchTerm);
  }

  if (location) {
    conditions.push("j.location LIKE ?");
    queryParams.push(`%${location}%`);
  }

  if (job_type) {
    conditions.push("j.job_type = ?");
    queryParams.push(job_type);
  }

  if (experience_level) {
    conditions.push("j.experience_level = ?");
    queryParams.push(experience_level);
  }

  if (job_mode) {
    conditions.push("j.job_mode = ?");
    queryParams.push(job_mode);
  }

  // Salary range filtering (assuming salary_range is stored as "min-max" format)
  if (salary_min || salary_max) {
    // This is a simplified approach - you might want to store min/max separately
    conditions.push("j.salary_range IS NOT NULL");
  }

  if (conditions.length) {
    query += " AND " + conditions.join(" AND ");
  }

  // Add sorting and pagination
  query += " ORDER BY j.created_at DESC LIMIT ? OFFSET ?";
  const offset = (page - 1) * limit;
  queryParams.push(parseInt(limit), parseInt(offset));

  db.query(query, queryParams, (err, results) => {
    if (err) {
      console.error("Error fetching jobs:", err);
      return res.status(500).json({ 
        message: "Error fetching jobs",
        error: err.message 
      });
    }

    // Get total count for pagination
    let countQuery = "SELECT COUNT(*) as total FROM jobs j WHERE j.status = ?";
    const countParams = [status];
    
    if (search) {
      countQuery += " AND (j.title LIKE ? OR j.description LIKE ? OR j.skills_required LIKE ?)";
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
    }
    
    if (location) {
      countQuery += " AND j.location LIKE ?";
      countParams.push(`%${location}%`);
    }
    
    if (job_type) {
      countQuery += " AND j.job_type = ?";
      countParams.push(job_type);
    }

    db.query(countQuery, countParams, (err, countResult) => {
      if (err) {
        console.error("Error counting jobs:", err);
        return res.status(500).json({ 
          message: "Error counting jobs",
          error: err.message 
        });
      }

      res.json({
        jobs: results,
        pagination: {
          current_page: parseInt(page),
          per_page: parseInt(limit),
          total: countResult[0].total,
          total_pages: Math.ceil(countResult[0].total / limit)
        }
      });
    });
  });
};


// GET JOB BY ID
exports.getJobById = (req, res) => {
  const { job_id } = req.params;

  // Update view count (if you have this column)
  db.query(
    "UPDATE jobs SET views_count = views_count + 1 WHERE job_id = ?",
    [job_id],
    (err) => {
      if (err) console.error("Error updating view count:", err);
    }
  );

  const query = `
    SELECT 
      j.*,
      c.company_name,
      c.company_logo,
      c.industry,
      c.company_size,
      c.location as company_location,
      c.about as company_description,
      c.linkedin_url as company_linkedin,
      c.website as company_website,
      c.company_email,
      c.hr_contact,
      (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.job_id) as applications_count,
      (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.job_id AND a.status = 'selected') as hirings_count
    FROM jobs j
    LEFT JOIN company c ON j.company_id = c.company_id
    WHERE j.job_id = ?
  `;

  db.query(query, [job_id], (err, results) => {
    if (err) {
      console.error("Error fetching job:", err);
      return res.status(500).json({ 
        message: "Error fetching job details",
        error: err.message 
      });
    }

    if (!results.length) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json(results[0]);
  });
};


// ===============================
// UPDATE JOB
// ===============================
exports.updateJob = (req, res) => {
  const user_id = req.user.user_id;
  const { job_id } = req.params;
  const {
    title,
    description,
    skills_required,
    job_type,
    location,
    salary_range,
    experience_level,
    education_requirements,
    responsibilities,
    benefits,
    job_mode,
    application_deadline,
    status
  } = req.body;

  // Verify job ownership
  const verifyQuery = `
    SELECT j.* FROM jobs j
    JOIN company c ON j.company_id = c.company_id
    WHERE j.job_id = ? AND c.user_id = ?
  `;

  db.query(verifyQuery, [job_id, user_id], (err, result) => {
    if (err) {
      console.error("Error verifying job:", err);
      return res.status(500).json({ 
        message: "Error verifying job ownership",
        error: err.message 
      });
    }
    
    if (!result.length) {
      return res.status(403).json({ 
        message: "You are not authorized to update this job" 
      });
    }

    // Build dynamic update query
    const updateFields = [];
    const values = [];

    const fields = {
      title,
      description,
      skills_required,
      job_type,
      location,
      salary_range,
      experience_level,
      education_requirements,
      responsibilities,
      benefits,
      job_mode,
      application_deadline,
      status
    };

    Object.keys(fields).forEach(key => {
      if (fields[key] !== undefined && fields[key] !== null) {
        updateFields.push(`${key} = ?`);
        values.push(fields[key]);
      }
    });

    if (!updateFields.length) {
      return res.status(400).json({ message: "No fields to update" });
    }

    // Add updated_at
    updateFields.push("updated_at = NOW()");
    values.push(job_id);

    const updateQuery = `UPDATE jobs SET ${updateFields.join(', ')} WHERE job_id = ?`;

    db.query(updateQuery, values, (err) => {
      if (err) {
        console.error("Error updating job:", err);
        return res.status(500).json({ 
          message: "Error updating job",
          error: err.message 
        });
      }

      res.json({ 
        message: "Job updated successfully",
        job_id: job_id
      });
    });
  });
};
// ===============================
// DELETE JOB (Soft Delete)
// ===============================
exports.deleteJob = (req, res) => {
  const user_id = req.user.user_id;
  const { job_id } = req.params;

  const verifyQuery = `
    SELECT j.* FROM jobs j
    JOIN company c ON j.company_id = c.company_id
    WHERE j.job_id = ? AND c.user_id = ?
  `;

  db.query(verifyQuery, [job_id, user_id], (err, result) => {
    if (err) {
      console.error("Error verifying job:", err);
      return res.status(500).json({ 
        message: "Error verifying job ownership",
        error: err.message 
      });
    }
    
    if (!result.length) {
      return res.status(403).json({ 
        message: "You are not authorized to delete this job" 
      });
    }

    db.query(
      "UPDATE jobs SET status = 'deleted', updated_at = NOW() WHERE job_id = ?",
      [job_id],
      (err) => {
        if (err) {
          console.error("Error deleting job:", err);
          return res.status(500).json({ 
            message: "Error deleting job",
            error: err.message 
          });
        }

        res.json({ 
          message: "Job deleted successfully",
          job_id: job_id
        });
      }
    );
  });
};
// // GET COMPANY INTERNSHIPS (only internships posted by companies)
exports.getCompanyInternships = (req, res) => {
  const query = `
    SELECT j.*, c.company_name
    FROM jobs j
    JOIN company c ON j.company_id = c.company_id
    WHERE j.status = 'active' AND j.job_type = 'internship'
    ORDER BY j.created_at DESC
  `;
  db.query(query, (err, result) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json({
      total: result.length,
      jobs: result,
    });
  });
};

// SEARCH JOBS
exports.searchJobs = (req, res) => {
  const { q, type } = req.query;

  let query = `
    SELECT j.*, c.company_name, c.company_logo
    FROM jobs j
    JOIN company c ON j.company_id = c.company_id
    WHERE j.status = 'active'
  `;

  const params = [];

  if (q && q.trim()) {
    const keyword = `%${q.trim()}%`;
    query += ` AND (
      j.title LIKE ? OR
      j.skills_required LIKE ? OR
      j.location LIKE ? OR
      c.company_name LIKE ? OR
      j.description LIKE ?
    )`;
    params.push(keyword, keyword, keyword, keyword, keyword);
  }

  if (type && type !== 'all') {
    query += ` AND j.job_type = ?`;
    params.push(type.toLowerCase());
  }

  query += ` ORDER BY j.created_at DESC LIMIT 50`;

  db.query(query, params, (err, result) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json({ total: result.length, jobs: result });
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
// ===============================
// GET COMPANY JOBS
// ===============================
exports.getCompanyJobs = (req, res) => {
  const user_id = req.user.user_id;
  const { status } = req.query;

  let query = `
    SELECT 
      j.*,
      (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.job_id) as applications_count,
      (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.job_id AND a.status = 'selected') as hirings_count
    FROM jobs j
    JOIN company c ON j.company_id = c.company_id
    WHERE c.user_id = ?
  `;

  const params = [user_id];

  if (status) {
    query += " AND j.status = ?";
    params.push(status);
  }

  query += " ORDER BY j.created_at DESC";

  db.query(query, params, (err, results) => {
    if (err) {
      console.error("Error fetching company jobs:", err);
      return res.status(500).json({ 
        message: "Error fetching company jobs",
        error: err.message 
      });
    }

    res.json(results);
  });
};

// ===============================
// GET JOB STATISTICS
// ===============================
exports.getJobStatistics = (req, res) => {
  const user_id = req.user.user_id;

  const query = `
    SELECT 
      COUNT(*) as total_jobs,
      SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_jobs,
      SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed_jobs,
      SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft_jobs,
      (SELECT COUNT(*) FROM applications a 
       JOIN jobs j ON a.job_id = j.job_id 
       JOIN company c ON j.company_id = c.company_id 
       WHERE c.user_id = ?) as total_applications
    FROM jobs j
    JOIN company c ON j.company_id = c.company_id
    WHERE c.user_id = ?
  `;

  db.query(query, [user_id, user_id], (err, results) => {
    if (err) {
      console.error("Error fetching job statistics:", err);
      return res.status(500).json({ 
        message: "Error fetching job statistics",
        error: err.message 
      });
    }

    res.json(results[0]);
  });
};

// ===============================
// CLOSE JOB (Stop accepting applications)
// ===============================
exports.closeJob = (req, res) => {
  const user_id = req.user.user_id;
  const { job_id } = req.params;

  const verifyQuery = `
    SELECT j.* FROM jobs j
    JOIN company c ON j.company_id = c.company_id
    WHERE j.job_id = ? AND c.user_id = ?
  `;

  db.query(verifyQuery, [job_id, user_id], (err, result) => {
    if (err) {
      console.error("Error verifying job:", err);
      return res.status(500).json({ 
        message: "Error verifying job ownership",
        error: err.message 
      });
    }
    
    if (!result.length) {
      return res.status(403).json({ 
        message: "You are not authorized to close this job" 
      });
    }

    db.query(
      "UPDATE jobs SET status = 'closed', updated_at = NOW() WHERE job_id = ?",
      [job_id],
      (err) => {
        if (err) {
          console.error("Error closing job:", err);
          return res.status(500).json({ 
            message: "Error closing job",
            error: err.message 
          });
        }

        res.json({ 
          message: "Job closed successfully",
          job_id: job_id
        });
      }
    );
  });
};