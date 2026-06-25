const db = require("../config/db");
const path = require('path');


// ===============================
// CREATE/UPDATE COMPANY PROFILE
// ===============================
exports.createCompanyProfile = (req, res) => {
  const user_id = req.user.user_id;
  const {
    company_name,
    industry,
    website,
    phone,
    location,
    about,
    company_size,
    founded_year,
    linkedin_url,
    logo
  } = req.body;

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

      const isProfileCompleted = (data) => {
        return !!(
          data.company_name &&
          data.industry &&
          data.website &&
          data.phone &&
          data.location &&
          data.about &&
          data.company_size &&
          data.founded_year &&
          data.linkedin_url
        );
      };

      if (result.length) {
        const profileData = {
          company_name: company_name || result[0].company_name,
          industry: industry || result[0].industry,
          website: website || result[0].website,
          phone: phone || result[0].phone,
          location: location || result[0].location,
          about: about || result[0].about,
          company_size: company_size || result[0].company_size,
          founded_year: founded_year || result[0].founded_year,
          linkedin_url: linkedin_url || result[0].linkedin_url,
          logo: logo || result[0].logo
        };

        const profile_completed = isProfileCompleted(profileData) ? 1 : 0;

        const updateQuery = `
          UPDATE company 
          SET company_name = ?, industry = ?, website = ?, phone = ?, 
              location = ?, about = ?, company_size = ?, founded_year = ?, 
              linkedin_url = ?, logo = ?, profile_completed = ?
          WHERE user_id = ?
        `;

        const values = [
          profileData.company_name,
          profileData.industry,
          profileData.website,
          profileData.phone,
          profileData.location,
          profileData.about,
          profileData.company_size,
          profileData.founded_year,
          profileData.linkedin_url,
          profileData.logo,
          profile_completed,
          user_id
        ];

        db.query(updateQuery, values, (err) => {
          if (err) return res.status(500).json(err);

          res.status(200).json({
            message: "Company profile updated successfully",
            profile_completed: profile_completed === 1,
            company_id: result[0].company_id
          });
        });
      } else {
        const profileData = {
          company_name,
          industry,
          website,
          phone,
          location,
          about,
          company_size,
          founded_year,
          linkedin_url,
          logo
        };

        const profile_completed = isProfileCompleted(profileData) ? 1 : 0;

        db.query(
          `INSERT INTO company (
            user_id, company_name, industry, website, phone, location, 
            about, company_size, founded_year, linkedin_url, logo, 
            verified_status, profile_completed
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)`,
          [
            user_id,
            company_name,
            industry,
            website || null,
            phone || null,
            location || null,
            about || null,
            company_size || null,
            founded_year || null,
            linkedin_url || null,
            logo || null,
            profile_completed
          ],
          (err, data) => {
            if (err) return res.status(500).json(err);

            res.status(201).json({
              message: "Company profile created successfully",
              profile_completed: profile_completed === 1,
              company_id: data.insertId
            });
          }
        );
      }
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
                totalInvites: 0,
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
};


// ===============================
// GET COMPANY APPLICANTS
// ===============================
exports.getCompanyApplicants = (req, res) => {
  const user_id = req.user.user_id;

  const query = `
    SELECT 
      a.application_id,
      a.status,
      a.applied_at,
      a.availability,
      a.resume_option,
      a.manual_resume_name,
      a.manual_resume_data,

      j.job_id,
      j.title AS job_title,

      COALESCE(s.student_id, 0) AS student_id,
      COALESCE(s.branch, 'General') AS branch,
      COALESCE(s.year, 'N/A') AS year,
      COALESCE(s.skills, '') AS skills,
      s.resume_data,
      s.resume_url,

      COALESCE(u.name, 'Candidate') AS name,
      COALESCE(u.email, 'Not Provided') AS email,
      COALESCE(u.mobile_number, 'N/A') AS mobile_number

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


// ===============================
// UPDATE APPLICATION STATUS
// ===============================
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
// GET COMPANY INVITES (stub - no campus drive table)
// ===============================
exports.getCompanyInvites = (req, res) => {
  return res.json([]);
};


// ===============================
// ACCEPT INVITE (stub - no campus drive table)
// ===============================
exports.acceptInvite = (req, res) => {
  return res.status(404).json({ message: "Invite feature not available" });
};


// ===============================
// REJECT INVITE (stub - no campus drive table)
// ===============================
exports.rejectInvite = (req, res) => {
  return res.status(404).json({ message: "Invite feature not available" });
};


// ===============================
// CREATE JOB FROM DRIVE
// ===============================
exports.createJobFromDrive = (req, res) => {
  const user_id = req.user.user_id;
  const { drive_id, title, description, skills } = req.body;

  db.query("SELECT * FROM company WHERE user_id = ?", [user_id], (err, compRes) => {
    if (err) return res.status(500).json(err);

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


// ===============================
// GET PROFILE STATUS
// ===============================
exports.getProfileStatus = (req, res) => {
  const user_id = req.user.user_id;

  db.query(
    "SELECT profile_completed FROM company WHERE user_id = ?",
    [user_id],
    (err, result) => {
      if (err) return res.status(500).json(err);

      if (!result.length) {
        return res.status(404).json({ message: "Company not found" });
      }

      res.json({
        profile_completed: result[0].profile_completed === 1
      });
    }
  );
};


// ===============================
// GET FULL COMPANY PROFILE
// ===============================
exports.getCompanyProfile = (req, res) => {
  const user_id = req.user.user_id;

  db.query("SELECT * FROM company WHERE user_id = ?", [user_id], (err, result) => {
    if (err) return res.status(500).json(err);

    if (!result.length) return res.status(404).json({ message: 'Company profile not found' });

    res.json({ data: result[0] });
  });
};


// ===============================
// UPDATE COMPANY PROFILE (with uploads)
// ===============================
exports.updateCompanyProfile = (req, res) => {
  const user_id = req.user.user_id;

  const {
    company_name,
    industry,
    company_email,
    hr_contact,
    website,
    company_size,
    founded_year,
    location,
    about_company,
    gst_number,
    registration_number,
    pan_number,
    linkedin_profile,
    official_website,
    official_company_email
  } = req.body;

  const files = req.files || {};

  if (!company_name || !industry) {
    return res.status(400).json({ message: 'Company name and industry are required' });
  }

  const profileData = {
    company_name,
    industry,
    company_email: company_email || null,
    hr_contact: hr_contact || null,
    website: website || null,
    company_size: company_size || null,
    founded_year: founded_year || null,
    location: location || null,
    about_company: about_company || null,
    gst_number: gst_number || null,
    registration_number: registration_number || null,
    pan_number: pan_number || null,
    linkedin_profile: linkedin_profile || null,
    official_website: official_website || null,
    official_company_email: official_company_email || null,
    gst_certificate: files.gst_certificate?.[0]
      ? path.join('uploads', 'company-documents', path.basename(files.gst_certificate[0].path))
      : null,
    registration_certificate: files.registration_certificate?.[0]
      ? path.join('uploads', 'company-documents', path.basename(files.registration_certificate[0].path))
      : null,
    pan_card: files.pan_card?.[0]
      ? path.join('uploads', 'company-documents', path.basename(files.pan_card[0].path))
      : null,
    company_logo: files.company_logo?.[0]
      ? path.join('uploads', 'company-documents', path.basename(files.company_logo[0].path))
      : null
  };

  db.query("SELECT * FROM company WHERE user_id = ?", [user_id], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.length) {
      const existing = result[0];

      const mergedData = {
        company_name: profileData.company_name || existing.company_name,
        industry: profileData.industry || existing.industry,
        company_email: profileData.company_email || existing.company_email,
        hr_contact: profileData.hr_contact || existing.hr_contact,
        website: profileData.website || existing.website,
        company_size: profileData.company_size || existing.company_size,
        founded_year: profileData.founded_year || existing.founded_year,
        location: profileData.location || existing.location,
        about_company: profileData.about_company || existing.about_company,
        gst_number: profileData.gst_number || existing.gst_number,
        registration_number: profileData.registration_number || existing.registration_number,
        pan_number: profileData.pan_number || existing.pan_number,
        linkedin_profile: profileData.linkedin_profile || existing.linkedin_profile,
        official_website: profileData.official_website || existing.official_website,
        official_company_email: profileData.official_company_email || existing.official_company_email,
        gst_certificate: profileData.gst_certificate || existing.gst_certificate,
        registration_certificate: profileData.registration_certificate || existing.registration_certificate,
        pan_card: profileData.pan_card || existing.pan_card,
        company_logo: profileData.company_logo || existing.company_logo
      };

      const isComplete = !!(
        mergedData.company_name &&
        mergedData.industry &&
        mergedData.company_email &&
        mergedData.hr_contact &&
        mergedData.website &&
        mergedData.company_size &&
        mergedData.founded_year &&
        mergedData.location &&
        mergedData.about_company &&
        mergedData.linkedin_profile &&
        mergedData.official_website &&
        mergedData.official_company_email
      );

      const updateQuery = `
        UPDATE company SET
          company_name = ?, industry = ?, company_email = ?, hr_contact = ?, website = ?,
          company_size = ?, founded_year = ?, location = ?, about_company = ?,
          gst_number = ?, registration_number = ?, pan_number = ?, linkedin_profile = ?,
          official_website = ?, official_company_email = ?, gst_certificate = ?,
          registration_certificate = ?, pan_card = ?, company_logo = ?, profile_completed = ?
        WHERE user_id = ?
      `;

      const values = [
        mergedData.company_name,
        mergedData.industry,
        mergedData.company_email,
        mergedData.hr_contact,
        mergedData.website,
        mergedData.company_size,
        mergedData.founded_year,
        mergedData.location,
        mergedData.about_company,
        mergedData.gst_number,
        mergedData.registration_number,
        mergedData.pan_number,
        mergedData.linkedin_profile,
        mergedData.official_website,
        mergedData.official_company_email,
        mergedData.gst_certificate,
        mergedData.registration_certificate,
        mergedData.pan_card,
        mergedData.company_logo,
        isComplete ? 1 : 0,
        user_id
      ];

      db.query(updateQuery, values, (err) => {
        if (err) return res.status(500).json(err);

        return res.json({ message: 'Profile updated', profile_completed: !!isComplete });
      });

    } else {
      const isComplete = !!(
        profileData.company_name &&
        profileData.industry &&
        profileData.company_email &&
        profileData.hr_contact &&
        profileData.website &&
        profileData.company_size &&
        profileData.founded_year &&
        profileData.location &&
        profileData.about_company &&
        profileData.linkedin_profile &&
        profileData.official_website &&
        profileData.official_company_email
      );

      const insertQuery = `
        INSERT INTO company (
          user_id, company_name, industry, company_email, hr_contact, website,
          company_size, founded_year, location, about_company,
          gst_number, registration_number, pan_number, linkedin_profile,
          official_website, official_company_email, gst_certificate,
          registration_certificate, pan_card, company_logo, verified_status, profile_completed
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
      `;

      const values = [
        user_id,
        profileData.company_name,
        profileData.industry,
        profileData.company_email,
        profileData.hr_contact,
        profileData.website,
        profileData.company_size,
        profileData.founded_year,
        profileData.location,
        profileData.about_company,
        profileData.gst_number,
        profileData.registration_number,
        profileData.pan_number,
        profileData.linkedin_profile,
        profileData.official_website,
        profileData.official_company_email,
        profileData.gst_certificate,
        profileData.registration_certificate,
        profileData.pan_card,
        profileData.company_logo,
        isComplete ? 1 : 0
      ];

      db.query(insertQuery, values, (err, data) => {
        if (err) return res.status(500).json(err);

        return res.status(201).json({
          message: 'Profile created',
          profile_completed: !!isComplete,
          company_id: data.insertId
        });
      });
    }
  });
};