const fs = require("fs");
const path = require("path");
const db = require("./config/db");

const sqlPath = path.join(__dirname, "DB_ALTER_COMPANY.sql");
const sql = fs.readFileSync(sqlPath, "utf8");

// Split by semicolons, but filter out comments and empty lines
const queries = sql
  .split(";")
  .map((q) => q.trim())
  .filter((q) => q.length > 0 && !q.startsWith("--"));

async function run() {
  for (let query of queries) {
    console.log("Executing query:", query);
    try {
      await new Promise((resolve, reject) => {
        db.query(query, (err, res) => {
          if (err) reject(err);
          else resolve(res);
        });
      });
      console.log("Success!");
    } catch (error) {
      console.error("Query failed:", error);
    }
  }
  process.exit();
}

run();
