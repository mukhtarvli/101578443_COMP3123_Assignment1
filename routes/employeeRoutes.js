const express = require("express");
const authenticate = require("../middleware/authMiddleware");
const employeeOwnership = require("../middleware/employeeOwnership");

const {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
} = require("../controllers/employeeController");

const {
  employeeValidation,
  employeeIdValidation,
  deleteEmployeeValidation,
} = require("../validators/employeeValidator");

const { validateRequest } = require("../validators/userValidator");

const router = express.Router();

// Every route below requires a valid JWT
router.use(authenticate);

// List the authenticated user's employees
router.get("/employees", getEmployees);

// Validate and create an employee
router.post(
  "/employees",
  employeeValidation,
  validateRequest,
  createEmployee
);

// Get an employee after checking ownership
router.get(
  "/employees/:eid",
  employeeIdValidation,
  validateRequest,
  employeeOwnership,
  getEmployeeById
);

// Update an employee after validation and ownership checks
router.put(
  "/employees/:eid",
  employeeIdValidation,
  employeeValidation,
  validateRequest,
  employeeOwnership,
  updateEmployee
);

// Delete an employee after checking ownership
router.delete(
  "/employees",
  deleteEmployeeValidation,
  validateRequest,
  employeeOwnership,
  deleteEmployee
);

module.exports = router;