const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const logger = require("../utils/logger");
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

// Authenticate a user and issue a JWT
// Authenticate a user and issue a JWT
async function login(req, res, next) {
  try {
    const { username, email, password } = req.body;

    // Find the user using the supplied username or email
    const filter = username !== undefined ? { username } : { email };
    const user = await User.findOne(filter).select("+password");

    if (!user) {
      // Never log submitted passwords or credentials
      logger("login_failed", { reason: "invalid_credentials" });

      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    // Compare the submitted password with the stored hash
    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      logger("login_failed", { reason: "invalid_credentials" });

      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    // Generate a token valid for one hour
    const token = jwt.sign({}, process.env.JWT_SECRET, {
      algorithm: "HS256",
      subject: user._id.toString(),
      expiresIn: "1h",
    });

    // Record success without logging the token
    logger("login_succeeded", {
      userId: user._id.toString(),
    });

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    // Record a safe error event and pass it to the error handler
    logger("login_error");
    next(error);
  }
}

module.exports = { signup, login };