const logger = require("../utils/logger");

// Record each completed request and its response status
function requestLogger(req, res, next) {
  const startedAt = Date.now();

  // Capture the path before Express enters a router
  const requestPath = req.path;

  res.on("finish", () => {
    logger("http_request", {
      method: req.method,
      path: requestPath,
      status: res.statusCode,
      durationMs: Date.now() - startedAt,
    });
  });

  next();
}

module.exports = requestLogger;