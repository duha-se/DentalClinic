const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const { getPool } = require('../db');
const router = express.Router();

const generateAvailableSlots = () => {
  const slots = [];
  for (let hour = 9; hour < 17; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      slots.push({
        time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
        available: true
      });
    }
  }
  return slots;
};

// Get available slots for a specific date
router.get('/available-slots/:date', async (req, res) => {
  try {
    const { date } = req.params;
    
    // Validate date format
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid date format. Use YYYY-MM-DD' 
      });
    }

    // Check if date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot book appointments for past dates' 
      });
    }

    // Block Fridays (no bookings allowed)
    const weekday = selectedDate.getDay(); // 0=Sun,1=Mon,...,5=Fri
    if (weekday === 5) {
      return res.json({ success: true, message: 'Fridays are closed for bookings', data: [] });
    }

    // Generate all slots and then remove or mark those already booked for the date
    const allSlots = generateAvailableSlots();

    // Fetch booked times for that date (exclude cancelled)
    const pool = await getPool();
    // Normalize returned times to HH:MM so we can compare with generated slots (which are HH:MM)
    const [bookedRows] = await pool.query(
      'SELECT TIME_FORMAT(appointment_time, "%H:%i") as time_hm FROM appointments WHERE appointment_date = ? AND status != ?',
      [date, 'cancelled']
    );
    const bookedTimes = new Set(bookedRows.map((r) => r.time_hm));

    const slots = allSlots.map((s) => ({
      time: s.time,
      available: !bookedTimes.has(s.time)
    }));

    res.json({
      success: true,
      message: 'Available slots retrieved successfully',
      data: slots,
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve available slots', 
      error: error.message 
    });
  }
});

// Book an appointment
router.post('/book', authenticateToken, async (req, res, next) => {
  try {
    console.log('[appointments/book] incoming request body:', req.body, 'user:', req.user && req.user.id);
    
    const pool = await getPool();
    const { service_id, appointment_date, appointment_time } = req.body;

    // Validate required fields
    if (!service_id || !appointment_date || !appointment_time) {
      return res.status(400).json({ 
        success: false, 
        message: 'Service, date, and time are required' 
      });
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(appointment_date)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid date format. Use YYYY-MM-DD' 
      });
    }

    // Validate time format
    if (!/^\d{2}:\d{2}$/.test(appointment_time)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid time format. Use HH:MM' 
      });
    }

    // Check if datetime is in the past
    const selectedDateTime = new Date(`${appointment_date}T${appointment_time}`);
    if (selectedDateTime < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book appointments for past dates and times'
      });
    }

    // Resolve service ID
    let serviceIdToUse = null;
    
    if (/^\d+$/.test(String(service_id))) {
      // Numeric ID provided
      const [serviceRows] = await pool.query(
        'SELECT id, name FROM services WHERE id = ?', 
        [service_id]
      );
      
      if (serviceRows.length === 0) {
        // Attempt to recover: maybe the frontend sent an id-like string
        const maybeName = String(service_id).trim();
        const [nameRows] = await pool.query(
          'SELECT id FROM services WHERE LOWER(name) = LOWER(?)', 
          [maybeName]
        );
        
        if (nameRows.length > 0) {
          serviceIdToUse = nameRows[0].id;
        } else {
          // Create new service as fallback
          console.warn(`[appointments/book] Service id ${service_id} not found; creating new service`);
          const [insertRes] = await pool.query(
            'INSERT INTO services (name, category, price, duration) VALUES (?, ?, ?, ?)', 
            [maybeName, 'Uncategorized', 0, 30]
          );
          serviceIdToUse = insertRes.insertId;
        }
      } else {
        serviceIdToUse = serviceRows[0].id;
      }
    } else {
      // Treat as service name (string)
      const serviceName = String(service_id).trim();
      const [nameRows] = await pool.query(
        'SELECT id FROM services WHERE LOWER(name) = LOWER(?)', 
        [serviceName]
      );
      
      if (nameRows.length > 0) {
        serviceIdToUse = nameRows[0].id;
      } else {
        // Create new service with defaults
        const [insertRes] = await pool.query(
          'INSERT INTO services (name, category, price, duration) VALUES (?, ?, ?, ?)', 
          [serviceName, 'Uncategorized', 0, 30]
        );
        serviceIdToUse = insertRes.insertId;
      }
    }

    console.log('[appointments/book] resolved serviceIdToUse =', serviceIdToUse);

    // Check for duplicate appointment (same user, service, date, and time)
    // Use TIME_FORMAT to compare only hours and minutes to be consistent with frontend format (HH:MM)
    const [duplicateCheck] = await pool.query(
      `SELECT id FROM appointments 
       WHERE user_id = ? AND service_id = ? AND appointment_date = ? AND TIME_FORMAT(appointment_time, '%H:%i') = ?`,
      [req.user.id, serviceIdToUse, appointment_date, appointment_time]
    );

    if (duplicateCheck.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'You already have an appointment at this date and time'
      });
    }

    // Prevent booking if slot already taken by ANY user (and not cancelled)
    // Prevent booking if slot already taken by ANY user (and not cancelled)
    // Compare appointment_time using hours:minutes to match frontend values
    const [slotTaken] = await pool.query(
      `SELECT id FROM appointments WHERE appointment_date = ? AND TIME_FORMAT(appointment_time, '%H:%i') = ? AND status != ?`,
      [appointment_date, appointment_time, 'cancelled']
    );

    if (slotTaken.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'This time slot is already booked'
      });
    }

    // Block booking on Fridays (weekday 5)
    const selectedDate = new Date(appointment_date);
    if (selectedDate.getDay() === 5) {
      return res.status(400).json({ success: false, message: 'Fridays are closed for bookings' });
    }

    // Insert appointment
    const [result] = await pool.query(
      `INSERT INTO appointments (user_id, service_id, appointment_date, appointment_time, status) 
       VALUES (?, ?, ?, ?, ?)`,
      [req.user.id, serviceIdToUse, appointment_date, appointment_time, 'pending']
    );

    const appointmentData = {
      id: result.insertId,
      user_id: req.user.id,
      service_id: serviceIdToUse,
      appointment_date,
      appointment_time,
      status: 'pending'
    };

    res.status(201).json({ 
      success: true, 
      message: 'Appointment booked successfully', 
      data: appointmentData 
    });
  } catch (error) {
    next(error);
  }
});

// Get user's appointments (without duplicates)
router.get('/my-appointments', authenticateToken, async (req, res) => {
  try {
    const pool = await getPool();
    
    const [rows] = await pool.query(
      `SELECT a.id, a.service_id, s.name as service_name, a.appointment_date, a.appointment_time, a.status, a.created_at
       FROM appointments a
       JOIN services s ON s.id = a.service_id
       WHERE a.user_id = ?
       ORDER BY a.appointment_date DESC, a.appointment_time DESC`,
      [req.user.id]
    );

    // Remove any duplicates (shouldn't be any if DB is clean)
    const uniqueRows = Array.from(
      new Map(rows.map(row => [row.id, row])).values()
    );

    res.json({ 
      success: true, 
      message: 'Appointments retrieved successfully', 
      data: uniqueRows 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve appointments', 
      error: error.message 
    });
  }
});

// Get single appointment by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const pool = await getPool();
    
    const [rows] = await pool.query(
      `SELECT a.id, a.service_id, s.name as service_name, a.appointment_date, a.appointment_time, a.status, a.created_at
       FROM appointments a
       JOIN services s ON s.id = a.service_id
       WHERE a.id = ? AND a.user_id = ?`,
      [req.params.id, req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Appointment not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Appointment retrieved successfully', 
      data: rows[0] 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve appointment', 
      error: error.message 
    });
  }
});

// Cancel appointment
router.put('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const pool = await getPool();
    
    // Verify appointment belongs to user
    const [appointmentCheck] = await pool.query(
      'SELECT id FROM appointments WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (appointmentCheck.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Appointment not found' 
      });
    }

    // Update status to cancelled
    await pool.query(
      'UPDATE appointments SET status = ? WHERE id = ?',
      ['cancelled', req.params.id]
    );

    res.json({ 
      success: true, 
      message: 'Appointment cancelled successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to cancel appointment', 
      error: error.message 
    });
  }
});

// Reschedule appointment
router.put('/:id/reschedule', authenticateToken, async (req, res) => {
  try {
    const pool = await getPool();
    const { appointment_date, appointment_time } = req.body;

    if (!appointment_date || !appointment_time) {
      return res.status(400).json({ 
        success: false, 
        message: 'Date and time are required' 
      });
    }

    // Verify appointment belongs to user
    const [appointmentCheck] = await pool.query(
      'SELECT id FROM appointments WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (appointmentCheck.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Appointment not found' 
      });
    }

    // Check if datetime is in the past
    const selectedDateTime = new Date(`${appointment_date}T${appointment_time}`);
    if (selectedDateTime < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot reschedule to past dates and times'
      });
    }

    // Update appointment
    await pool.query(
      'UPDATE appointments SET appointment_date = ?, appointment_time = ? WHERE id = ?',
      [appointment_date, appointment_time, req.params.id]
    );

    res.json({ 
      success: true, 
      message: 'Appointment rescheduled successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to reschedule appointment', 
      error: error.message 
    });
  }
});

module.exports = router;