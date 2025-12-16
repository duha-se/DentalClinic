function errorHandler(err, req, res, next) {
  // If response was already sent, delegate to default Express error handler
  if (res.headersSent) {
    return next(err);
  }
  
  // Handle CORS errors specifically
  if (err.message && err.message.includes('CORS')) {
    console.error('CORS Error:', err.message, 'Origin:', req.headers.origin);
    return res.status(403).json({ 
      success: false,
      error: 'CORS policy: Origin not allowed',
      message: err.message
    });
  }
  
  console.error('Error:', err.message);
  if (process.env.NODE_ENV === 'development') {
    console.error('Stack:', err.stack);
  }
  
  // Check if error has a status code
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({ 
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

function notFoundHandler(req, res, next) {
  res.status(404).json({ 
    success: false,
    error: 'Route not found',
    path: req.originalUrl 
  });
}

module.exports = { errorHandler, notFoundHandler };
