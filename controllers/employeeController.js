const Employee = require("../models/Employee");

// Create an employee owned by the authenticated user
async function createEmployee(req, res, next) {
  try {
    const {
      first_name,
      last_name,
      email,
      position,
      salary,
      date_of_joining,
      department,
    } = req.body;

    const employee = await Employee.create({
      first_name,
      last_name,
      email,
      position,
      salary,
      date_of_joining,
      department,

      // Determine ownership from the verified token
      user: req.user._id,
    });

    return res.status(201).json({
      message: "Employee created successfully",
      employee,
    });
  } catch (error) {
    next(error);
  }
}

// List only employees owned by the authenticated user
async function getEmployees(req, res, next) {
  try {
    const employees = await Employee.find({
      user: req.user._id,
    });

    return res.status(200).json({
      employees,
    });
  } catch (error) {
    next(error);
  }
}

// Find an employee belonging to the authenticated user
async function getEmployeeById(req, res, next) {
  try {
    const employee = await Employee.findOne({
      _id: req.params.eid,
      user: req.user._id,
    });

    if (!employee) {
      return res.status(404).json({
        error: "Employee not found",
      });
    }

    return res.status(200).json({ employee });
  } catch (error) {
    next(error);
  }
}

// Update an employee owned by the authenticated user
async function updateEmployee(req, res, next) {
  try {
    const {
      first_name,
      last_name,
      email,
      position,
      salary,
      date_of_joining,
      department,
    } = req.body;

    const employee = await Employee.findOneAndUpdate(
      {
        _id: req.params.eid,
        user: req.user._id,
      },
      {
        $set: {
          first_name,
          last_name,
          email,
          position,
          salary,
          date_of_joining,
          department,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!employee) {
      return res.status(404).json({
        error: "Employee not found",
      });
    }

    return res.status(200).json({
      message: "Employee updated successfully",
      employee,
    });
  } catch (error) {
    next(error);
  }
}

// Delete an employee owned by the authenticated user
async function deleteEmployee(req, res, next) {
  try {
    const employee = await Employee.findOneAndDelete({
      _id: req.query.eid,
      user: req.user._id,
    });

    if (!employee) {
      return res.status(404).json({
        error: "Employee not found",
      });
    }

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
}


module.exports = {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
};