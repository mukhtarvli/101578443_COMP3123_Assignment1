const express = require("express");
const { signup } = require("../controllers/userController");
const {
  signupValidation,
  validateRequest,
} = require("../validators/userValidator");

const router = express.Router();

// Validate the request before running the signup controller
router.post("/signup", signupValidation, validateRequest, signup);

module.exports = router;