const mongoose = require("mongoose");

// Define the information stored for each employee
const employeeSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },

    last_name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },

    position: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    salary: {
      type: Number,
      required: true,
      validate: {
        validator: (value) => Number.isFinite(value) && value > 0,
        message: "Salary must be a positive number",
      },
    },

    date_of_joining: {
      type: Date,
      required: true,
    },

    department: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    // Link this employee to the user who created it
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
      index: true,
    },
  },
  {
    // Automatically record creation and update times
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

module.exports = mongoose.model("Employee", employeeSchema);