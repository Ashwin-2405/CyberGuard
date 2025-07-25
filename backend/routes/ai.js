// backend/routes/ai.js
/**
 * CyberGuard AI Log Analysis Route
 * Integrates Node.js backend with Python for log anomaly/AI analysis.
 * Author: [Your Name/Team]
 */

const express = require("express");
const { PythonShell } = require("python-shell");
const fs = require("fs/promises");
const fscb = require("fs"); // for callback-based methods (required by some APIs)
const path = require("path");
const router = express.Router();

// Utility to generate unique filenames for temp files
function uniqueTempFile(ext = "log") {
  // Secure, unpredictable name with timestamp and random digits
  const id = `${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
  return `ai_temp_${id}.${ext}`;
}

// POST /api/ai/analyze
router.post("/analyze", async (req, res) => {
  try {
    const { logs } = req.body;

    if (!logs || !Array.isArray(logs) || logs.length === 0) {
      return res.status(400).json({ error: "Provide logs as a non-empty array in JSON body." });
    }

    // Paths for temp input and output
    const tempLogPath = path.join(__dirname, "../ai", uniqueTempFile("log"));
    const outputPath = path.join(__dirname, "../ai", uniqueTempFile("json"));

    // 1. Write log lines to input file
    await fs.writeFile(tempLogPath, logs.join("\n"), "utf8");

    // 2. Run Python analyzer
    PythonShell.run(
      path.join(__dirname, "../ai/log_analyzer.py"),
      { args: [tempLogPath, outputPath] },
      async (err) => {
        // Clean up input file always (after run)
        try { await fs.unlink(tempLogPath); } catch { /* ignore */ }

        if (err) {
          console.error("❌ Python AI script error:", err);
          // Clean up output if script failed
          try { await fs.unlink(outputPath); } catch { /* ignore */ }
          return res.status(500).json({ error: "AI analysis failed" });
        }

        // 3. Read output
        fscb.readFile(outputPath, "utf8", async (readErr, data) => {
          // Clean up output file always
          try { await fs.unlink(outputPath); } catch { /* ignore */ }

          if (readErr) {
            console.error("❌ Failed to read AI output file:", readErr);
            return res.status(500).json({ error: "Could not read AI analysis result" });
          }
          try {
            const parsed = JSON.parse(data);
            res.json({
              status: "success",
              count: Array.isArray(parsed) ? parsed.length : (parsed && typeof parsed === "object" ? 1 : 0),
              result: parsed,
            });
          } catch (parseError) {
            console.error("❌ Failed to parse AI output JSON:", parseError);
            res.status(500).json({ error: "Invalid JSON output from AI analysis" });
          }
        });
      }
    );
  } catch (e) {
    console.error("❌ /api/ai/analyze route error:", e);
    res.status(500).json({ error: "Unexpected server error" });
  }
});

module.exports = router;
