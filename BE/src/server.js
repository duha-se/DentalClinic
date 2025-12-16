const app = require('./app');

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log(`Dental Clinic API running on port ${PORT}`);
});

/* =========================
   Graceful shutdown
========================= */
const shutdown = () => {
  console.log('Shutting down server gracefully...');
  server.close(() => {
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);