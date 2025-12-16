const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getPool } = require('../db');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';
const TOKEN_EXPIRES = '7d';

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRES }
  );
}

router.post('/register', async (req, res, next) => {
  try {
    const pool = await getPool();
    const { name, email, phone, password, confirmPassword, age, address } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, phone, and password are required' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    const [exists] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (exists.length > 0) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, phone, password_hash, age, address) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, phone, passwordHash, age || null, address || null]
    );

    const userData = { id: result.insertId, name, email, phone, age: age || null, address: address || null };
    const token = generateToken(userData);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: { ...userData, token }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const pool = await getPool();
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user);
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      age: user.age,
      address: user.address
    };

    res.json({
      success: true,
      message: 'Login successful',
      data: { ...userData, token }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/profile', authenticateToken, async (req, res, next) => {
  try {
    const pool = await getPool();
    const [rows] = await pool.query(
      'SELECT id, name, email, phone, age, address, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    next(error);
  }
});

router.put('/profile', authenticateToken, async (req, res, next) => {
  try {
    const pool = await getPool();
    const { name, phone, age, address } = req.body;

    await pool.query(
      'UPDATE users SET name = ?, phone = ?, age = ?, address = ? WHERE id = ?',
      [name, phone, age || null, address || null, req.user.id]
    );

    const [rows] = await pool.query(
      'SELECT id, name, email, phone, age, address, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    res.json({ success: true, message: 'Profile updated', data: rows[0] });
  } catch (error) {
    next(error);
  }
});

// Overview: profile + appointments + treatment plan
router.get('/overview', authenticateToken, async (req, res, next) => {
  try {
    const pool = await getPool();

    const [users] = await pool.query(
      'SELECT id, name, email, phone, age, address, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const user = users[0];

    const [appointments] = await pool.query(
      `SELECT a.id, a.service_id, s.name as service_name, a.appointment_date, a.appointment_time, a.status, a.created_at
       FROM appointments a
       JOIN services s ON s.id = a.service_id
       WHERE a.user_id = ?
       ORDER BY a.appointment_date DESC, a.appointment_time DESC`,
      [req.user.id]
    );

    let [plans] = await pool.query(
      'SELECT id, title, description, status, created_at FROM treatment_plans WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );

    // Seed a default treatment plan if none exists
    if (plans.length === 0) {
      const defaults = [
        ['Initial Examination', 'Comprehensive oral exam and x-rays', 'completed'],
        ['Cleaning & Polishing', 'Full mouth cleaning session', 'in_progress'],
        ['Restorative Plan', 'Schedule fillings or other required treatments', 'planned']
      ];
      await pool.query(
        'INSERT INTO treatment_plans (user_id, title, description, status) VALUES ?',
        [defaults.map(d => [req.user.id, ...d])]
      );
      [plans] = await pool.query(
        'SELECT id, title, description, status, created_at FROM treatment_plans WHERE user_id = ? ORDER BY created_at DESC',
        [req.user.id]
      );
    }

    res.json({
      success: true,
      data: { user, appointments, treatmentPlan: plans }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;