const mysql = require("mysql2");
require("dotenv").config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 3306
});

db.connect((err) => {
  if (err) {
    console.error("DB Connection Failed:", err);
    return;
  }
  console.log("MySQL Connected Successfully");

  const dbName = process.env.DB_NAME || "tipp_db";
  db.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``, (err) => {
    if (err) {
      console.error(`Failed to create database ${dbName}:`, err);
      return;
    }

    db.changeUser({ database: dbName }, (err) => {
      if (err) {
        console.error(`Failed to select database ${dbName}:`, err);
        return;
      }
      console.log(`Using Database: ${dbName}`);
      const { initTables } = require("./initDb");
      initTables(db);
    });
  });
});

module.exports = db;