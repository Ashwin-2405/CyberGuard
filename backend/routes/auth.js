// backend/routes/auth.js
/**
 * CyberGuard Authentication Routes – PRODUCTION + DEMO READY
 * - Database-backed (PostgreSQL), strong credentials validation, clear errors
 * - Optionally supports /me endpoint and auto-login after register
 */

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const client = require("../config/db"); // PostgreSQL client
const router = express.Router();

// ===== Utility Functions =====

// Validate username (min 3 alphanum chars) and password (min 6 chars)
function validateCredentials(username, password) {
  const userOk = typeof username === "string" && /^[a-zA-Z0-9_]{3,32}$/.test(username);
  const passOk = typeof password === "string" && password.length >= 6 && password.length <= 128;
  return userOk && passOk;
}

// ===== Registration Route =====
router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  // Input validation (prod + demo)
  if (!username || !password || !validateCredentials(username, password)) {
    return res.status(400).json({ msg: "Invalid username or password (username: 3-32 alphanumeric, password: 6+ characters)" });
  }

  try {
    // Check if user exists (DB)
    const userCheck = await client.query("SELECT id FROM users WHERE username = $1", [username]);
    if (userCheck.rows.length > 0) {
      return res.status(409).json({ msg: "User already exists, try another username." });
    }

    // Hash the password
    const hash = await bcrypt.hash(password, 12);

    // Insert new user into DB
    await client.query(
      "INSERT INTO users (username, password) VALUES ($1, $2)",
      [username, hash]
    );

    // Direct-login after register (get new user ID)
    const userGet = await client.query("SELECT id FROM users WHERE username = $1", [username]);
    const user = userGet.rows[0];

    // Prepare token payload
    const payload = {
      id: user.id,
      username: username,
    };

    // JWT config
    const jwtSecret = process.env.JWT_SECRET || "SECRET";
    const jwtExpires = process.env.JWT_EXPIRES_IN || "2h";

    // Sign JWT
    const token = jwt.sign(payload, jwtSecret, { expiresIn: jwtExpires });

    res.json({ msg: "Registered successfully!", token });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ msg: "Server error during registration." });
  }
});

// ===== Login Route =====
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  // Input validation (prod + demo)
  if (!username || !password || !validateCredentials(username, password)) {
    return res.status(400).json({ msg: "Invalid credentials (username: 3-32 alphanumeric, password: 6+ characters)" });
  }

  try {
    // Find user in DB
    const userResult = await client.query("SELECT * FROM users WHERE username = $1", [username]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    const user = userResult.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    const payload = {
      id: user.id,
      username: user.username,
    };

    const jwtSecret = process.env.JWT_SECRET || "SECRET";
    const jwtExpires = process.env.JWT_EXPIRES_IN || "2h";

    const token = jwt.sign(payload, jwtSecret, { expiresIn: jwtExpires });

    res.json({ token, msg: "Login successful!" });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ msg: "Server error during login." });
  }
});

// ===== /me: Validate and Fetch Current User (Optional) =====
router.get("/me", async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ msg: "No token provided." });
  }
  try {
    const jwtSecret = process.env.JWT_SECRET || "SECRET";
    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, jwtSecret);

    // Optionally fetch user from DB for latest info
    const userResult = await client.query("SELECT id, username FROM users WHERE id=$1", [decoded.id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ msg: "User not found." });
    }
    const user = userResult.rows[0];
    res.json({ user: { id: user.id, username: user.username } });
  } catch (err) {
    return res.status(401).json({ msg: "Token invalid or expired." });
  }
});

module.exports = router;
