const { rateLimit } = require("express-rate-limit");

// Create a separate rate limiter for each authentication endpoint
function createAuthLimiter() {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
      error: "Too many requests. Please try again later.",
    },
  });
}

// Each endpoint gets its own request counter
const signupLimiter = createAuthLimiter();
const loginLimiter = createAuthLimiter();

module.exports = { signupLimiter, loginLimiter };