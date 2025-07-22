const express = require("express");
const multer = require("multer");
const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/upload", upload.single("file"), (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ msg: "No file uploaded" });

  // Dummy log analysis: count lines with "error"
  const fs = require("fs");
  const data = fs.readFileSync(file.path, "utf-8").split("\n");
  let errorCount = 0;
  data.forEach(line => {
    if (line.toLowerCase().includes("error")) errorCount++;
  });

  res.json({
    totalLines: data.length,
    errorCount,
    message: "Analysis complete"
  });
});

module.exports = router;
