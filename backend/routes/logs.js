// backend/routes/logs.js
/**
 * CyberGuard Log Upload & Analysis API
 * Author: [Your Name/Team]
 * Accepts .log/.txt/.csv files, returns security insights.
 */

const express = require("express");
const multer = require("multer");
const fs = require("fs/promises");
const path = require("path");
const router = express.Router();

// Multer config – save to uploads/ (make sure dir exists and .gitignored!)
const upload = multer({
  dest: "uploads/",
  fileFilter: (req, file, cb) => {
    // Only accept plain text, CSV, or .log files
    const allowedTypes = [
      "text/plain", // .txt, .log
      "text/csv",   // .csv
      "application/octet-stream", // fallback for .log
    ];
    if (
      allowedTypes.includes(file.mimetype) ||
      /\.(log|txt|csv)$/i.test(file.originalname)
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only .log, .txt, or .csv files are allowed"));
    }
  },
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB limit
});

// === POST /upload – Analyze Security Log ===
router.post("/upload", upload.single("file"), async (req, res) => {
  const file = req.file;
  if (!file)
    return res.status(400).json({ msg: "No file uploaded or type not allowed" });

  const uploadPath = file.path;
  let result = null;

  try {
    const text = await fs.readFile(uploadPath, "utf-8");
    const lines = text.split(/\r?\n/).filter(Boolean);

    // Simple analysis – count errors, warnings, info
    let errorCount = 0, warningCount = 0, infoCount = 0;
    lines.forEach((line) => {
      const lc = line.toLowerCase();
      if (lc.includes("error")) errorCount++;
      if (lc.includes("warning")) warningCount++;
      if (lc.includes("info")) infoCount++;
    });

    // For demo: Add more sophisticated parsing/AI here if desired.
    result = {
      totalLines: lines.length,
      errorCount,
      warningCount,
      infoCount,
      // Optionally: Top error message, or first error line for summary.
      firstError: lines.find((l) => l.toLowerCase().includes("error")) || null,
      fileName: file.originalname,
      message: "Analysis complete"
    };

    res.json(result);
  } catch (err) {
    console.error("Log analyze error:", err);
    res.status(500).json({ msg: "Log analysis failed. File may not be readable or valid." });
  } finally {
    // Always clean up uploaded file:
    try { await fs.unlink(uploadPath); } catch (e) { /* ignore */ }
  }
});

module.exports = router;
