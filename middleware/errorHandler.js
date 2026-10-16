const logger = require("../utils/logger");

// Centralized error handler: Express requires all four parameters
function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  let status = 500;
  let message = "Internal server error";
  let reason = "unexpected_error";

  // Handle duplicate usernames or emails
  if (error.code === 11000) {
    status = 409;
    message = "Username or email already exists";
    reason = "duplicate_key";
  }
  // Handle incorrectly formatted JSON
  else if (error.type === "entity.parse.failed") {
    status = 400;
    message = "Invalid JSON request body";
    reason = "malformed_json";
  }
  // Handle Mongoose schema validation failures
  else if (error.name === "ValidationError") {
    status = 400;
    message = "Invalid data";
    reason = "schema_validation";
  }
  // Handle invalid database IDs
  else if (error.name === "CastError") {
    status = 400;
    message = "Invalid data format";
    reason = "invalid_data_format";
  }

  // Record safe details without passwords, tokens, or database credentials
  logger("request_error", {
    method: req.method,
    path: req.baseUrl + req.path,
    status,
    reason,
  });

  return res.status(status).json({
    error: message,
  });
}

module.exports = errorHandler;