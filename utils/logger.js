const fs = require("fs");
const path = require("path");

// Vercel sets this environment variable automatically
const isVercel = process.env.VERCEL === "1";

let logStream;

// Store logs in a file when running locally
if (!isVercel) {
  const logsDirectory = path.join(__dirname, "../logs");

  fs.mkdirSync(logsDirectory, { recursive: true });

  logStream = fs.createWriteStream(
    path.join(logsDirectory, "app.log"),
    { flags: "a" }
  );

  logStream.on("error", () => {
    console.error("Unable to write to the application log.");
  });
}

// Record safe event details without passwords or tokens
function logger(event, details = {}) {
  const entry = JSON.stringify({
    ...details,
    timestamp: new Date().toISOString(),
    event,
  });

  if (isVercel) {
    console.log(entry);
  } else {
    logStream.write(`${entry}\n`);
  }
}

module.exports = logger;