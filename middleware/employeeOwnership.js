const Employee = require("../models/Employee");
const logger = require("../utils/logger");

// Check ownership after authentication and ID validation
async function employeeOwnership(req, res, next) {
  try {
    const employeeId = req.params.eid ?? req.query.eid;

    // Read only the owner field for the authorization check
    const employee = await Employee.findById(employeeId).select("user");

    if (!employee) {
      return res.status(404).json({
        error: "Employee not found",
      });
    }

    if (!employee.user.equals(req.user._id)) {
      logger("authorization_failed", {
        reason: "employee_not_owned",
        userId: req.user._id.toString(),
        employeeId: employee._id.toString(),
        method: req.method,
        path: req.baseUrl + req.path,
      });

      return res.status(403).json({
        error: "You do not have permission to access this employee",
      });
    }

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = employeeOwnership;