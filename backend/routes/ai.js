const express = require('express');
const { PythonShell } = require('python-shell');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// POST /api/ai/analyze
router.post('/analyze', (req, res) => {
  const logs = req.body.logs;
  if(!logs || !Array.isArray(logs) || logs.length === 0) {
    return res.status(400).json({ error: "Provide logs as a non-empty array in JSON body." });
  }

  // Write logs to a temp file (unique for each run)
  const tempLogPath = path.join(__dirname, '../ai', `frontend_input_${Date.now()}.log`);
  const outputPath = path.join(__dirname, '../ai', `result_${Date.now()}.json`);

  // Write provided log lines into file
  fs.writeFileSync(tempLogPath, logs.join('\n'), 'utf8');

  // Run Python analysis script with new temp file as argument
  PythonShell.run(
    path.join(__dirname, '../ai/log_analyzer.py'),
    { args: [tempLogPath, outputPath] },
    (err) => {
      // Clean up the temp log file after analysis (optional)
      fs.unlink(tempLogPath, () => {});
      if (err) {
        console.error('❌ Failed to run Python script:', err);
        return res.status(500).json({ error: 'AI analysis failed' });
      }
      fs.readFile(outputPath, 'utf8', (err, data) => {
        // Clean up the output JSON file after reading (optional)
        fs.unlink(outputPath, () => {});
        if (err) {
          console.error('❌ Failed to read AI output:', err);
          return res.status(500).json({ error: 'Could not read JSON output' });
        }
        try {
          const parsed = JSON.parse(data);
          res.json({
            status: 'success',
            count: parsed.length,
            result: parsed,
          });
        } catch (parseError) {
          res.status(500).json({ error: 'Invalid output format from AI' });
        }
      });
    }
  );
});

module.exports = router;
