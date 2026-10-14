// Load environment variables from .env
require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const connectDB = require("./config/db");

const app = express();
const PORT = process.env.PORT || 8081;

// Add HTTP security headers
app.use(helmet());

// Allow the API to read JSON request bodies
app.use(express.json());

// Health check: confirms that the server is running
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Employee API is running",
  });
});

// Return JSON for routes that do not exist
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
  });
});

// Connect to MongoDB before starting the server
async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    // Avoid printing connection details that could contain credentials
    console.error(
      "Database connection failed. Check your .env and Atlas access settings."
    );
    process.exit(1);
  }
}

startServer();