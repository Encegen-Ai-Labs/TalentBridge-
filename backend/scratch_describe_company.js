const db = require("./config/db");

db.query("DESCRIBE company", (err, result) => {
  if (err) {
    console.error("Failed to describe company table:", err);
  } else {
    console.log("Company Table Structure:");
    console.log(result);
  }
  process.exit();
});
