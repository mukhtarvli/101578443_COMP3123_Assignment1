const { body, param, query } = require("express-validator");


// Fields clients are allowed to provide
const employeeFields = [
  "first_name",
  "last_name",
  "email",
  "position",
  "salary",
  "date_of_joining",
  "department",
];

// Reusable validation for required text fields
function requiredText(field, maxLength) {
  return body(field)
    .isString()
    .withMessage(`${field} is required and must be text`)
    .bail()
    .trim()
    .isLength({ min: 1, max: maxLength })
    .withMessage(`${field} must contain 1–${maxLength} characters`);
}

// Used for employee creation and full updates
const employeeValidation = [
  // Reject unexpected fields, including a client-supplied owner
  body().custom((value) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new Error("Request body must be a JSON object");
    }

    const hasUnexpectedFields = Object.keys(value).some(
      (key) => !employeeFields.includes(key)
    );

    if (hasUnexpectedFields) {
      throw new Error("Request contains unexpected employee fields");
    }

    return true;
  }),

  requiredText("first_name", 50),
  requiredText("last_name", 50),
  requiredText("position", 100),
  requiredText("department", 100),

  // Require a valid email
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

  // Require a JSON number, not a string such as "50000"
  body("salary")
    .custom(
      (value) =>
        typeof value === "number" &&
        Number.isFinite(value) &&
        value > 0
    )
    .withMessage("Salary must be a positive number"),

  // Require a real calendar date in YYYY-MM-DD format
  body("date_of_joining")
    .isString()
    .withMessage("Date of joining is required and must be text")
    .bail()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage("Date of joining must use YYYY-MM-DD")
    .bail()
    .isISO8601({ strict: true })
    .withMessage("Date of joining must be a valid calendar date"),
];

// Validate IDs in URLs such as /employees/:eid
const employeeIdValidation = [
  param("eid")
    .isString()
    .withMessage("Employee ID must be text")
    .bail()
    .isMongoId()
    .withMessage("Invalid employee ID"),
];

// Validate the query parameter used by DELETE /employees?eid=...
const deleteEmployeeValidation = [
  query("eid")
    .isString()
    .withMessage("Employee ID is required and must be text")
    .bail()
    .isMongoId()
    .withMessage("Invalid employee ID"),
];


module.exports = {
  employeeValidation,
  employeeIdValidation,
  deleteEmployeeValidation,
};