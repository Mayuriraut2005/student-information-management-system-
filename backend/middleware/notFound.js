/**
 * 404 Not Found Middleware
 */
const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Resource not found at ${req.originalUrl}`,
  });
};

module.exports = notFound;
