const db = require("./config/db");

db.query("SELECT * FROM company", (err, result) => {
  if (err) {
    console.error("Query failed:", err);
  } else {
    console.log("All Companies in DB:");
    console.log(result);
  }
  process.exit();
});
