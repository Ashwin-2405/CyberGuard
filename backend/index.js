// backend/index.js
/**
 * CyberGuard Backend – Main Server
 * Clean, production-grade Express setup with security, logging, modular routing.
 */

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ======= Middleware =======
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// ======= Modular Routers =======
try {
  app.use("/api/auth", require("./routes/auth"));
  app.use("/api/logs", require("./routes/logs"));
  app.use("/api/ai", require("./routes/ai"));
} catch (e) {
  console.error("❌ Failed to load one or more routers:", e.message);
  // Optionally terminate or serve partial API
}

// ======= File Analysis Route (Must be registered!) ============
try {
  const analyzeRouter = require('./routes/analyze');
  app.use('/api', analyzeRouter); // This makes /api/analyze available
} catch (err) {
  console.error("❌ Failed to load analyze router:", err.message);
}

// ======= Protected Route Example =======
const authMiddleware = require("./middleware/auth");
app.get('/api/protected', authMiddleware, (req, res) => {
  res.json({ msg: `Hello, ${req.user.username || "user"}! You accessed a protected route.` });
});

// ======= Health & Welcome Routes =======
app.get("/", (req, res) =>
  res.type("text").send("🚦 CyberGuard Backend API is running! [Docs: /api/docs]")
);

app.get("/api/status", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    env: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

// === (Optional) Serve Static API Docs ===
// Uncomment to serve docs at /api/docs
// app.use("/api/docs", express.static(__dirname + "/docs"));

// ======= 404 & Error Handling =======
app.use((req, res, next) => {
  res.status(404).json({ error: "API route not found" });
});
app.use((err, req, res, next) => {
  console.error("❌ Server error:", err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === "production"
      ? err.message || "Something went wrong. Please try again."
      : (err.stack || err.message || "Unknown error"),
  });
});

// ======= Start Server =======
app.listen(PORT, () =>
  console.log(`🚀 CyberGuard backend on http://localhost:${PORT} (${process.env.NODE_ENV || "dev"})`)
);
