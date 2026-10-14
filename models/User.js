const mongoose = require("mongoose");

// Define the fields each user document will contain
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },

    // Store only a password hash, never the original password
    password: {
      type: String,
      required: true,
      select: false,
    },
  },
  {
    // Automatically maintain creation and update dates
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

// Create and export the User model
module.exports = mongoose.model("User", userSchema);