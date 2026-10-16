const { body, validationResult } = require("express-validator");
const logger = require("../utils/logger");

const signupValidation = [
  // Only accept the expected signup fields
  body().custom((value) => {
    const allowedFields = ["username", "email", "password"];

    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new Error("Request body must be a JSON object");
    }

    if (Object.keys(value).some((key) => !allowedFields.includes(key))) {
      throw new Error("Only username, email, and password are allowed");
    }

    return true;
  }),

  // Validate and trim the username
  body("username")
    .isString()
    .withMessage("Username is required and must be text")
    .bail()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must contain 3–30 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores"),

  // Validate the email and store it in lowercase
  body("email")
    .isString()
    .withMessage("Email is required and must be text")
    .bail()
    .trim()
    .isLength({ max: 254 })
    .withMessage("Email is too long")
    .isEmail()
    .withMessage("Enter a valid email address")
    .toLowerCase(),

  // Validate the original password before hashing it
  body("password")
    .isString()
    .withMessage("Password is required and must be text")
    .bail()
    .isLength({ min: 8 })
    .withMessage("Password must contain at least 8 characters")
    .matches(/[a-z]/)
    .withMessage("Password must contain a lowercase letter")
    .matches(/[A-Z]/)
    .withMessage("Password must contain an uppercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain a number")
    .custom((value) => Buffer.byteLength(value, "utf8") <= 72)
    .withMessage("Password must not exceed 72 bytes"),
];

// Return validation errors without exposing submitted values
// Return validation errors and record which fields failed
function validateRequest(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const details = errors.array().map((error) => ({
      field: error.path || "body",
      message: error.msg,
    }));

    // Log field names only, never submitted values or passwords
    logger("validation_failed", {
      method: req.method,
      path: req.baseUrl + req.path,
      fields: [...new Set(details.map((error) => error.field))],
    });

    return res.status(400).json({
      error: "Validation failed",
      details,
    });
  }

  next();
}


// Validate login credentials
const loginValidation = [
  body().custom((value) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new Error("Request body must be a JSON object");
    }

    const allowedFields = ["username", "email", "password"];

    if (Object.keys(value).some((key) => !allowedFields.includes(key))) {
      throw new Error("Only username, email, and password are allowed");
    }

    const hasUsername = value.username !== undefined;
    const hasEmail = value.email !== undefined;

    if (hasUsername === hasEmail) {
      throw new Error("Provide either username or email, but not both");
    }

    return true;
  }),

  body("username")
    .optional()
    .isString()
    .withMessage("Username must be text")
    .bail()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must contain 3–30 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Invalid username format"),

  body("email")
    .optional()
    .isString()
    .withMessage("Email must be text")
    .bail()
    .trim()
    .isLength({ max: 254 })
    .withMessage("Email is too long")
    .isEmail()
    .withMessage("Enter a valid email address")
    .toLowerCase(),

  body("password")
    .isString()
    .withMessage("Password is required and must be text")
    .bail()
    .notEmpty()
    .withMessage("Password is required")
    .custom((value) => Buffer.byteLength(value, "utf8") <= 72)
    .withMessage("Password must not exceed 72 bytes"),
];

module.exports = {
  signupValidation,
  loginValidation,
  validateRequest,
};