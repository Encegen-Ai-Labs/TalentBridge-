const queries = [
  `CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255),
    role ENUM('student','company','admin'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    mobile_number VARCHAR(15),
    work_status VARCHAR(50)
  )`,

  `CREATE TABLE IF NOT EXISTS company (
    company_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    company_name VARCHAR(150),
    verified_status TINYINT(1) DEFAULT 0,
    industry VARCHAR(100),
    company_email VARCHAR(255),
    hr_contact VARCHAR(50),
    website VARCHAR(255),
    company_size VARCHAR(50),
    founded_year VARCHAR(4),
    location VARCHAR(255),
    about_company TEXT,
    gst_number VARCHAR(32),
    registration_number VARCHAR(128),
    pan_number VARCHAR(16),
    linkedin_profile VARCHAR(255),
    official_website VARCHAR(255),
    official_company_email VARCHAR(255),
    gst_certificate VARCHAR(512),
    registration_certificate VARCHAR(512),
    pan_card VARCHAR(512),
    company_logo VARCHAR(512),
    profile_completed TINYINT(1) NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS student (
    student_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    college_id INT,
    skills TEXT,
    resume_url TEXT,
    branch VARCHAR(50),
    year INT,
    approval_status ENUM('pending','approved','rejected') DEFAULT 'approved',
    preferences TEXT,
    resume_data LONGTEXT,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS jobs (
    job_id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT,
    company_name VARCHAR(150),
    title VARCHAR(150),
    description TEXT,
    skills_required TEXT,
    job_type ENUM('internship','full-time') DEFAULT 'full-time',
    location VARCHAR(100),
    job_mode VARCHAR(50) DEFAULT 'onsite',
    status ENUM('active','closed','draft','deleted') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    views_count INT DEFAULT 0,
    drive_id INT,
    FOREIGN KEY (company_id) REFERENCES company(company_id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS applications (
    application_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    job_id INT,
    status ENUM('applied','shortlisted','rejected','selected') DEFAULT 'applied',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    availability VARCHAR(255),
    resume_option VARCHAR(50) DEFAULT 'inbuilt',
    manual_resume_name VARCHAR(255),
    manual_resume_data LONGTEXT,
    FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(job_id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS placements (
    placement_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    company_id INT,
    job_id INT,
    package DECIMAL(10,2),
    placed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES company(company_id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(job_id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS otp_resets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  otp_code VARCHAR(6) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`
];

function initTables(db) {
  console.log("Initializing database tables...");
  
  let p = Promise.resolve();
  queries.forEach((query, index) => {
    p = p.then(() => {
      return new Promise((resolve) => {
        db.query(query, (err) => {
          if (err) {
            console.error(`Error creating table at step ${index + 1}:`, err.message);
          }
          resolve();
        });
      });
    });
  });
  
  p.then(() => {
    console.log("All tables checked / created successfully.");
  });
}

module.exports = { initTables };
