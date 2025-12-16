require('dotenv').config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env'
});

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const authRoutes = require('../routes/authRoutes');
const serviceRoutes = require('../routes/serviceRoutes');
const appointmentRoutes = require('../routes/appointmentRoutes');
const invoiceRoutes = require('../routes/invoiceRoutes');

const { errorHandler, notFoundHandler } = require('../middleware/errorMiddleware');
const { getPool } = require('../db');

const app = express();

/* =========================
   Database initialization
========================= */
// getPool().catch(err => {
//   console.error('Failed to initialize database:', err);
// //   process.exit(1);
// });

/* =========================
   CORS configuration
========================= */
const rawOrigins = process.env.CORS_ORIGIN || 'http://localhost:3000';
const allowedOrigins = rawOrigins
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

if (process.env.NODE_ENV === 'development') {
  [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001'
  ].forEach(origin => {
    if (!allowedOrigins.includes(origin)) {
      allowedOrigins.push(origin);
    }
  });
}

app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Accept localhost origins (any port) and 127.0.0.1 for development convenience
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

/* =========================
   Security & body parsing
========================= */
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginEmbedderPolicy: false
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

/* =========================
   Dev logging
========================= */
if (process.env.NODE_ENV === 'development') {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

/* =========================
   Required endpoints
========================= */
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'healthy' });
});

app.get('/api/version', (_req, res) => {
  res.json({ version: '1.0.0' });
});

/* =========================
   API routes
========================= */
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/invoices', invoiceRoutes);

/* =========================
   Errors
========================= */
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;