/**
 * Global Centralized Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error safely for debugging
  if (process.env.NODE_ENV !== 'test') {
    console.error(`[Error] ${err.name}: ${err.message}`);
  }

  // Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid format for field '${err.path}': '${err.value}' is not a valid identifier.`,
    });
  }

  // Mongoose Duplicate Key Error (Code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'studentId';
    const val = err.keyValue ? err.keyValue[field] : '';
    return res.status(409).json({
      success: false,
      message: `A student with ${field} '${val}' already exists. Please choose a unique identifier.`,
      field,
    });
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((el) => el.message);
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  // JSON Body Parser Syntax Error
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Malformed JSON payload in request body',
    });
  }

  // Default Internal Server Error (500)
  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: error.message || 'An unexpected internal server error occurred',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
