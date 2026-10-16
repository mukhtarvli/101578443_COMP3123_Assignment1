const mongoose = require("mongoose");

let connectionPromise = null;

// Reuse the database connection across requests
async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured");
  }

  // Share one connection attempt between simultaneous requests
  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(process.env.MONGODB_URI, {
        dbName: "comp3123_assignment1",
        serverSelectionTimeoutMS: 10000,
      })
      .then(() => {
        console.log("MongoDB connected successfully");
        return mongoose.connection;
      })
      .finally(() => {
        connectionPromise = null;
      });
  }

  return connectionPromise;
}

module.exports = connectDB;