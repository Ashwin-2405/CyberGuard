// backend/routes/auth.js
/**
 * CyberGuard Authentication Routes
 * Author: [Your Name/Team]
 * In-memory user storage (for demo); ready for DB integration.
 */

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();

// ===== In-memory user store (replace with persistent DB for prod) =====
const USERS = [];

// ===== Utility Functions =====

// Validate username (min 3 alphanum chars) and password (min 6 chars)
function validateCredentials(username, password) {
  const userOk = typeof username === "string" && /^[a-zA-Z0-9_]{3,32}$/.test(username);
  const passOk = typeof password === "string" && password.length >= 6 && password.length <= 128;
  return userOk && passOk;
}

// ===== Register =====
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate presence & strength
    if (!username || !password || !validateCredentials(username, password))
      return res.status(400).json({ msg: "Invalid username or password (min 3/6 chars, alphanumeric)." });

    // Check duplicate
    if (USERS.find(u => u.username === username))
      return res.status(409).json({ msg: "User already exists, try a different username." });

    // Secure password hash
    const hash = await bcrypt.hash(password, 12);
    USERS.push({ username, password: hash, created: new Date() });

    // Optional: directly login after register
    const token = jwt.sign(
      { username },
      process.env.JWT_SECRET || "SECRET",
      { expiresIn: "2h" }
    );

    res.json({ msg: "Registered successfully!", token });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ msg: "Registration failed. Try again." });
  }
});

// ===== Login =====
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate presence & format
    if (!username || !password || !validateCredentials(username, password))
      return res.status(400).json({ msg: "Invalid credentials (min 3/6 chars, alphanumeric username)." });

    const user = USERS.find(u => u.username === username);
    if (!user) return res.status(401).json({ msg: "User not found." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ msg: "Invalid credentials." });

    const token = jwt.sign(
      { username },
      process.env.JWT_SECRET || "SECRET",
      { expiresIn: "2h" }
    );
    res.json({ token, msg: "Login successful!" });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ msg: "Login failed. Try again." });
  }
});

// ===== Optional: Auth test route =====
router.get("/me", (req, res) => {
  // Demo: use Bearer token to fetch username
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) return res.status(401).json({ msg: "No token." });
  try {
    const decoded = jwt.verify(auth.split(" ")[1], process.env.JWT_SECRET || "SECRET");
    res.json({ user: decoded.username });
  } catch {
    res.status(401).json({ msg: "Token invalid or expired." });
  }
});

module.exports = router;
