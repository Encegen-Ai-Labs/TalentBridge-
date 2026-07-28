const mysql = require("mysql2");
require("dotenv").config();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

db.getConnection((err, connection) => {
  if (err) {
    console.error("DB Connection Failed:", err);
    return;
  }
  connection.release();
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