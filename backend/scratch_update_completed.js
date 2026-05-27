const db = require("./config/db");

const selectQuery = "SELECT * FROM company";

db.query(selectQuery, (err, results) => {
  if (err) {
    console.error("Failed to select companies:", err);
    process.exit(1);
  }

  const updates = results.map((company) => {
    const isComplete = !!(
      company.company_name &&
      company.industry &&
      company.company_email &&
      company.hr_contact &&
      company.website &&
      company.company_size &&
      company.founded_year &&
      company.location &&
      company.about_company &&
      company.linkedin_profile &&
      company.official_website &&
      company.official_company_email
    );

    const val = isComplete ? 1 : 0;
    return new Promise((resolve, reject) => {
      db.query(
        "UPDATE company SET profile_completed = ? WHERE company_id = ?",
        [val, company.company_id],
        (err, res) => {
          if (err) reject(err);
          else resolve({ company_id: company.company_id, name: company.company_name, completed: val });
        }
      );
    });
  });

  Promise.all(updates)
    .then((res) => {
      console.log("Updated completion statuses:");
      console.log(res);
      process.exit(0);
    })
    .catch((err) => {
      console.error("Updates failed:", err);
      process.exit(1);
    });
});
