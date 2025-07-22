const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();

const USERS = []; // Temporary in-memory storage

router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  if (USERS.find(u => u.username === username))
    return res.status(409).json({ msg: "User exists" });

  const hash = await bcrypt.hash(password, 10);
  USERS.push({ username, password: hash });
  res.json({ msg: "Registered successfully" });
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = USERS.find(u => u.username === username);
  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.status(401).json({ msg: "Invalid credentials" });

  const token = jwt.sign(
    { username },
    process.env.JWT_SECRET || "SECRET",
    { expiresIn: "2h" }
  );
  res.json({ token });
});

module.exports = router;
