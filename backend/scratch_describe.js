const db = require("./config/db");

const alterQuery = `
  ALTER TABLE applications 
  ADD COLUMN availability VARCHAR(255) NULL, 
  ADD COLUMN resume_option VARCHAR(50) DEFAULT 'inbuilt', 
  ADD COLUMN manual_resume_name VARCHAR(255) NULL, 
  ADD COLUMN manual_resume_data LONGTEXT NULL
`;

db.query(alterQuery, (err, result) => {
  if (err) {
    console.error("Migration failed:", err);
  } else {
    console.log("Migration successful: Added availability, resume_option, manual_resume_name, manual_resume_data to applications table.", result);
  }
  process.exit();
});
