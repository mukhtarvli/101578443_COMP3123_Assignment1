const bcrypt = require("bcryptjs");
const User = require("../models/User");

// Register a new user
async function signup(req, res, next) {
  try {
    const { username, email, password } = req.body;

    // Check whether the username or email is already registered
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      return res.status(409).json({
        error: "Username or email already exists",
      });
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    // Return only safe fields, never the password hash
    return res.status(201).json({
      message: "User registered successfully",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    // Pass errors to the centralized error handler
    next(error);
  }
}

module.exports = { signup };