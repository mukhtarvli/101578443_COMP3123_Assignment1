const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");
const logger = require("../utils/logger");

// Verify the JWT and identify the authenticated user
async function authenticate(req, res, next) {
  const authorization = req.get("Authorization");

  // Require the format: Authorization: Bearer <token>
  const match = authorization?.match(/^Bearer\s+(\S+)$/i);

  if (!match) {
    logger("authentication_failed", {
      reason: "missing_or_malformed_bearer_token",
      method: req.method,
      path: req.baseUrl + req.path,
    });

    return res.status(401).json({
      error: "A Bearer token is required",
    });
  }

  // A missing secret is a server configuration error
  if (!process.env.JWT_SECRET) {
    return next(new Error("JWT_SECRET is not configured"));
  }

  let decoded;

  try {
    decoded = jwt.verify(match[1], process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });
  } catch (error) {
    // The error variable is available inside this catch block
    const expired = error.name === "TokenExpiredError";

    logger("authentication_failed", {
      reason: expired ? "expired_token" : "invalid_token",
      method: req.method,
      path: req.baseUrl + req.path,
    });

    return res.status(401).json({
      error: expired ? "Token has expired" : "Invalid token",
    });
  }

  // The token's subject must contain a valid user ID
  if (
    !decoded ||
    typeof decoded !== "object" ||
    typeof decoded.sub !== "string" ||
    !mongoose.isObjectIdOrHexString(decoded.sub)
  ) {
    logger("authentication_failed", {
      reason: "invalid_token_subject",
      method: req.method,
      path: req.baseUrl + req.path,
    });

    return res.status(401).json({
      error: "Invalid token",
    });
  }

  try {
    // Confirm that the user still exists
    const user = await User.findById(decoded.sub).select(
      "_id username email"
    );

    if (!user) {
      logger("authentication_failed", {
        reason: "user_not_found",
        method: req.method,
        path: req.baseUrl + req.path,
      });

      return res.status(401).json({
        error: "Invalid token",
      });
    }

    // Make the authenticated user available to later handlers
    req.user = user;
    next();
  } catch (error) {
    // Database failures go to the centralized error handler
    logger("authentication_error", {
      reason: "user_lookup_failed",
    });

    next(error);
  }
}

module.exports = authenticate;