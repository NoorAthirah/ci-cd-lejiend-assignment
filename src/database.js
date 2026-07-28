const mysql = require("mysql2/promise");

function createDatabasePool() {
  return mysql.createPool({
    host: process.env.DB_HOST || "mysql",
    port: Number(process.env.DB_PORT || 3306),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0
  });
}

module.exports = { createDatabasePool };
