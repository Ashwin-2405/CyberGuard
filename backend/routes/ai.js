// 📁 File: backend/routes/ai.js

const express = require('express');
const { PythonShell } = require('python-shell');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// POST /api/ai/analyze
router.post('/analyze', (req, res) => {
  const scriptPath = path.join(__dirname, '../ai/log_analyzer.py');
  const outputPath = path.join(__dirname, '../ai/log_analysis_output.json');

  PythonShell.run(scriptPath, null, (err) => {
    if (err) {
      console.error('❌ Failed to run Python script:', err);
      return res.status(500).json({ error: 'AI analysis failed' });
    }

    fs.readFile(outputPath, 'utf8', (err, data) => {
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
        console.error('❌ Failed to parse AI JSON output:', parseError);
        res.status(500).json({ error: 'Invalid output format from AI' });
      }
    });
  });
});

module.exports = router;
