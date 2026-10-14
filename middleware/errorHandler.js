// Centralized error handler: Express requires all four parameters
function errorHandler(error, req, res, next) {
  // Handle duplicate users, including simultaneous signup requests
  if (error.code === 11000) {
    return res.status(409).json({
      error: "Username or email already exists",
    });
  }

  // Handle incorrectly formatted JSON
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({
      error: "Invalid JSON request body",
    });
  }

  // Handle Mongoose schema validation failures
  if (error.name === "ValidationError") {
    return res.status(400).json({
      error: "Invalid data",
    });
  }

  // Do not expose internal details to the client
  return res.status(500).json({
    error: "Internal server error",
  });
}

module.exports = errorHandler;