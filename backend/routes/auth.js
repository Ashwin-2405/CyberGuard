/**
 * CyberGuard Authentication Routes – UNIVERSAL LOGIN & EMAIL REGISTRATION READY
 * - Allows login with username or email
 * - Registers and stores username, email (unique), and password hash
 */

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const client = require("../config/db"); // PostgreSQL client
const router = express.Router();

// ===== Utility Functions =====

function validateUsername(username) {
  return typeof username === "string" && /^[a-zA-Z0-9_]{3,32}$/.test(username);
}
function validatePassword(password) {
  return typeof password === "string" && password.length >= 6 && password.length <= 128;
}
function validateEmail(email) {
  // Simple robust check (not exhaustive)
  return typeof email === "string" &&
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/i.test(email) &&
    email.length <= 100;
}

// ===== Registration Route =====
router.post("/register", async (req, res) => {
  const { username, password, email } = req.body;

  if (!username || !password || !email ||
      !validateUsername(username) ||
      !validatePassword(password) ||
      !validateEmail(email)
  ) {
    return res.status(400).json({
      msg: "Invalid registration. Username: 3-32 alphanumeric, email required/valid, password: 6-128 chars."
    });
  }

  try {
    // Check if username OR email taken
    const userCheck = await client.query(
      "SELECT id FROM users WHERE username = $1 OR email = $2",
      [username, email]
    );
    if (userCheck.rows.length > 0) {
      return res.status(409).json({ msg: "Username or email already in use. Please choose another." });
    }

    const hash = await bcrypt.hash(password, 12);

    // Insert user (with email)
    await client.query(
      "INSERT INTO users (username, password, email) VALUES ($1, $2, $3)",
      [username, hash, email]
    );

    // Fetch new user for id
    const userGet = await client.query("SELECT id FROM users WHERE username = $1", [username]);
    const user = userGet.rows[0];

    const payload = { id: user.id, username, email };
    const jwtSecret = process.env.JWT_SECRET || "SECRET";
    const jwtExpires = process.env.JWT_EXPIRES_IN || "2h";

    const token = jwt.sign(payload, jwtSecret, { expiresIn: jwtExpires });

    res.json({ msg: "Registered successfully!", token });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ msg: "Server error during registration." });
  }
});

// ===== Universal Login Route (username or email) =====
router.post("/login", async (req, res) => {
  const { identifier, password } = req.body; // identifier = username **or** email

  if (!identifier || !password || !validatePassword(password)) {
    return res.status(400).json({ msg: "Invalid login. Username/email required, password: 6-128 chars." });
  }

  try {
    // Try to match by username or email (case-insensitive for email)
    const userResult = await client.query(
      "SELECT * FROM users WHERE username = $1 OR LOWER(email) = LOWER($1)",
      [identifier]
    );
    if (userResult.rows.length === 0) {
      return res.status(401).json({ msg: "Invalid credentials (user/email or password incorrect)" });
    }

    const user = userResult.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ msg: "Invalid credentials (user/email or password incorrect)" });
    }

    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
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

    const userResult = await client.query("SELECT id, username, email FROM users WHERE id=$1", [decoded.id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ msg: "User not found." });
    }
    const user = userResult.rows[0];
    res.json({ user });
  } catch (err) {
    return res.status(401).json({ msg: "Token invalid or expired." });
  }
});

module.exports = router;
