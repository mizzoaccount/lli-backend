/*class ErrorResponse extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
    }
  }
  
  module.exports = ErrorResponse;*/

  // middleware/errorMiddleware.js
const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
  console.error('Error Stack:', err.stack);
  
  let error = { ...err };
  error.message = err.message;

  // Cloudinary errors
  if (err.name === 'CloudinaryError') {
    const message = `Cloudinary error: ${err.message}`;
    error = new ErrorResponse(message, 500);
  }

  // File upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File size too large (max 5MB)';
    error = new ErrorResponse(message, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error'
  });
};

module.exports = errorHandler;