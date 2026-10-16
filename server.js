// Load local environment variables
require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const errorHandler = require("./middleware/errorHandler");
const logger = require("./utils/logger");
const requestLogger = require("./middleware/requestLogger");

const app = express();
const PORT = process.env.PORT || 8081;

// Add HTTP security headers
app.use(helmet());

// Log requests, including JSON parsing failures
app.use(requestLogger);

// Parse JSON before processing routes
app.use(express.json());

// Health check: confirms the API is running
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Employee API is running",
  });
});

// Ensure database connectivity before processing API requests
app.use("/api/v1", async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    logger("database_connection_failed");
    next(error);
  }
});

// Register user and employee routes
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/emp", employeeRoutes);

// Return JSON for unknown routes
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
  });
});

// Centralized error handling must follow the routes
app.use(errorHandler);

// Start a local server when running node server.js
async function startServer() {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
      logger("server_started", { port: PORT });
    });

    server.on("error", (error) => {
      logger("server_start_failed", {
        code: error.code || "UNKNOWN",
      });

      if (error.code === "EADDRINUSE") {
        console.error(
          `Port ${PORT} is already in use. Stop the other server first.`
        );
      } else {
        console.error("Server failed to start.");
      }

      process.exitCode = 1;
    });
  } catch (error) {
    logger("database_connection_failed");
    console.error(
      "Database connection failed. Check your environment and Atlas access settings."
    );
    process.exitCode = 1;
  }
}

// Vercel handles incoming requests using the exported app
if (require.main === module && process.env.VERCEL !== "1") {
  startServer();
}

module.exports = app;