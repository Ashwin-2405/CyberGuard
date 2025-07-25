// backend/index.js
/**
 * CyberGuard Backend – Main Server
 * Clean, production-grade Express setup with security, logging, and modular routing.
 * Author: [Your Name/Team]
 */

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

const app = express();

// ======= Middleware =======
app.use(helmet()); // Security headers (prevents common vulnerabilities)

app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || "http://localhost:3000", // Restrict in prod!
  credentials: true,
}));

app.use(express.json({ limit: "2mb" })); // Safe JSON payload limit
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev")); // Log traffic

// ======= Modular Routers =======
try {
  app.use("/api/auth", require("./routes/auth"));
  app.use("/api/logs", require("./routes/logs"));
  app.use("/api/ai", require("./routes/ai"));
} catch (e) {
  console.error("❌ Failed to load one or more routers:", e.message);
  // Optionally terminate or serve partial API
}

// ======= Health & Welcome Routes =======
app.get("/", (req, res) =>
  res.type("text").send("🚦 CyberGuard Backend API is running! [Docs: /api/docs]")
);

// Status endpoint for health checks and uptime bots
app.get("/api/status", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    env: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

// === (Optional) Serve Static API Docs ===
// Uncomment below to serve .html or Markdown docs at /api/docs
// app.use("/api/docs", express.static(__dirname + "/docs"));

// ======= 404 & Error Handling =======
// Handle undefined API routes nicely (JSON)
app.use((req, res, next) => {
  res.status(404).json({ error: "API route not found" });
});

// Centralized error handler (never leaks stack in production)
app.use((err, req, res, next) => {
  console.error("❌ Server error:", err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === "production"
      ? err.message || "Something went wrong. Please try again."
      : (err.stack || err.message || "Unknown error"),
  });
});

// ======= Start Server =======
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 CyberGuard backend on http://localhost:${PORT} (${process.env.NODE_ENV || "dev"})`)
);
