-- ALTER TABLE to add company profile fields
ALTER TABLE company
  ADD COLUMN company_email VARCHAR(255) DEFAULT NULL,
  ADD COLUMN hr_contact VARCHAR(50) DEFAULT NULL,
  ADD COLUMN website VARCHAR(255) DEFAULT NULL,
  ADD COLUMN company_size VARCHAR(50) DEFAULT NULL,
  ADD COLUMN founded_year VARCHAR(4) DEFAULT NULL,
  ADD COLUMN location VARCHAR(255) DEFAULT NULL,
  ADD COLUMN about_company TEXT DEFAULT NULL,
  ADD COLUMN gst_number VARCHAR(32) DEFAULT NULL,
  ADD COLUMN registration_number VARCHAR(128) DEFAULT NULL,
  ADD COLUMN pan_number VARCHAR(16) DEFAULT NULL,
  ADD COLUMN linkedin_profile VARCHAR(255) DEFAULT NULL,
  ADD COLUMN official_website VARCHAR(255) DEFAULT NULL,
  ADD COLUMN official_company_email VARCHAR(255) DEFAULT NULL,
  ADD COLUMN gst_certificate VARCHAR(512) DEFAULT NULL,
  ADD COLUMN registration_certificate VARCHAR(512) DEFAULT NULL,
  ADD COLUMN pan_card VARCHAR(512) DEFAULT NULL,
  ADD COLUMN company_logo VARCHAR(512) DEFAULT NULL,
  ADD COLUMN profile_completed TINYINT(1) NOT NULL DEFAULT 0;

-- Optional: create index on user_id if not present
-- ALTER TABLE company ADD INDEX idx_user_id (user_id);
