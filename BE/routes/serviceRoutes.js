const express = require('express');
const { getPool } = require('../db');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const pool = await getPool();
    const [rows] = await pool.query('SELECT id, name, category, price, duration FROM services ORDER BY id ASC');
    res.json({ success: true, message: 'Services retrieved successfully', data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve services', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const pool = await getPool();
    const [rows] = await pool.query('SELECT id, name, category, price, duration FROM services WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    res.json({ success: true, message: 'Service retrieved successfully', data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve service', error: error.message });
  }
});

router.get('/category/:category', async (req, res) => {
  try {
    const pool = await getPool();
    const [rows] = await pool.query(
      'SELECT id, name, category, price, duration FROM services WHERE LOWER(category) = LOWER(?)',
      [req.params.category]
    );
    res.json({ success: true, message: 'Services retrieved successfully', data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve services', error: error.message });
  }
});

module.exports = router;