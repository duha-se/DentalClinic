const mysql = require('mysql2/promise');

const {
  DB_HOST = 'localhost',
  DB_PORT = 3306,
  DB_USER = 'root',
  DB_PASSWORD = 'root',
  DB_NAME = 'dental_clinic'
} = process.env;

let pool;

async function getPool() {
  if (pool) return pool;

  // 🔹 نضمن وجود قاعدة البيانات دائمًا (حتى في test)
  const bootstrapConnection = await mysql.createConnection({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD
  });

  await bootstrapConnection.query(
    `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``
  );
  await bootstrapConnection.end();

  // 🔹 الاتصال بقاعدة البيانات
  pool = mysql.createPool({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 5
  });

  // ===== Schema =====
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) NOT NULL UNIQUE,
      phone VARCHAR(50) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      age INT NULL,
      address VARCHAR(255) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS services (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      category VARCHAR(100),
      price DECIMAL(10,2) DEFAULT 0,
      duration INT DEFAULT 30
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS appointments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      service_id INT NOT NULL,
      appointment_date DATE NOT NULL,
      appointment_time TIME NOT NULL,
      status ENUM('pending','completed','cancelled') DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
    )
  `);

  // ===== Seed services =====
  const [rows] = await pool.query(
    'SELECT COUNT(*) as count FROM services'
  );

  if (rows[0].count === 0) {
    await pool.query(
      'INSERT INTO services (name, category, price, duration) VALUES ?',
      [[
        ['General Checkup', 'Preventive', 50, 30],
        ['Teeth Cleaning', 'Preventive', 80, 45],
        ['Cavity Filling', 'Restorative', 120, 60]
      ]]
    );
  }

  return pool;
}

async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

module.exports = { getPool, closePool };