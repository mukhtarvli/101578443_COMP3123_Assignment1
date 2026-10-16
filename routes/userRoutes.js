const express = require("express");

const {
  signup,
  login,
} = require("../controllers/userController");

const {
  signupValidation,
  loginValidation,
  validateRequest,
} = require("../validators/userValidator");

const {
  signupLimiter,
  loginLimiter,
} = require("../middleware/authLimiter");

const router = express.Router();

// Limit signup requests before validating and creating a user
router.post(
  "/signup",
  signupLimiter,
  signupValidation,
  validateRequest,
  signup
);

// Limit login requests before validating and authenticating
router.post(
  "/login",
  loginLimiter,
  loginValidation,
  validateRequest,
  login
);

module.exports = router;