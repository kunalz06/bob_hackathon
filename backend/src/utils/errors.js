/**
 * Custom error classes for better error handling and categorization
 */

class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404);
  }
}

class StorageError extends AppError {
  constructor(message) {
    super(`Storage error: ${message}`, 500);
  }
}

class GeneratorError extends AppError {
  constructor(message, generator) {
    super(`Generator error in ${generator}: ${message}`, 500);
  }
}

/**
 * Async error wrapper to avoid try-catch in every route handler
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Wrapped function
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Global error handler middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
  // Default to 500 if statusCode not set
  const statusCode = err.statusCode || 500;
  const isOperational = err.isOperational !== undefined ? err.isOperational : false;

  // Log error for debugging
  if (!isOperational || statusCode >= 500) {
    console.error('Error:', {
      name: err.name,
      message: err.message,
      stack: err.stack,
      statusCode,
    });
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: {
      code: err.name || 'ERROR',
      message: err.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  StorageError,
  GeneratorError,
  asyncHandler,
  errorHandler,
};

// Made with Bob
