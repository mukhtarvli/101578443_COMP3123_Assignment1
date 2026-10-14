const mongoose = require("mongoose");

async function connectDB() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing from .env");
  }

  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: "comp3123_assignment1",
  });

  // Send a command to MongoDB and wait for its response
  const result = await mongoose.connection.db.admin().ping();

  console.log("MongoDB connected successfully");
  console.log("Database:", mongoose.connection.name);
  console.log("Database ping:", result.ok);
}

module.exports = connectDB;