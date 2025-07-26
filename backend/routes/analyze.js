const express = require('express');
const multer = require('multer');
const fileType = require('file-type');
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const THREAT_PATTERNS = [ /* ...as before... */ ];
const SEVERITY_SCORE = { DANGER: 4, WARNING: 2, INFO: 1, SAFE: 0 };

function getThreatLevel(score) {
  if (score >= 7) return "DANGEROUS";
  if (score >= 4) return "WARNING";
  if (score >= 1) return "INFO";
  return "SAFE";
}

// Helper to decide text-ness robustly
function looksLikeText(buffer, detectedType, originalname) {
  const ext = originalname.split('.').pop()?.toLowerCase() ?? '';
  // 1. Mime check
  if (/^text|json|xml|csv|log|py|js|java|c$|cpp$|sh$|md$|pl$|html|php|bash|shell/i.test(detectedType)) return true;
  // 2. Extension check
  if (/\.(txt|py|js|php|log|md|sh|c|cpp|json|xml|csv|java|pl|html)$/i.test(originalname)) return true;
  // 3. Content: ratio of printable chars
  if (!buffer || !buffer.length) return false;
  const asString = buffer.toString('utf8');
  let readableChars = asString.replace(/[\x00-\x08\x0B-\x1F\x7F]/g, '').length;
  return (readableChars / buffer.length) > 0.85;
}

// -- MAIN ROUTE --
router.post('/analyze', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ result: 'No file uploaded.' });
    }
    const { originalname, mimetype, buffer } = req.file;

    // Improved filetype detection
    let detectedType = mimetype;
    if (!detectedType || detectedType === 'application/octet-stream') {
      const ft = await fileType.fromBuffer(buffer);
      detectedType = ft ? ft.mime : 'unknown';
    }

    let content = null, textLines = [];
    const isText = looksLikeText(buffer, detectedType, originalname);

    if (isText) {
      content = buffer.toString('utf8');
      textLines = content.split(/\r?\n/);
    }

    const errors = [];
    let stats = { DANGER: 0, WARNING: 0, INFO: 0, SAFE: 0 };
    let uniqueErrorTypes = new Set();
    let severityRawScore = 0;
    let highestSingle = 0;

    if (content && textLines.length) {
      textLines.forEach((line, idx) => {
        for (const pattern of THREAT_PATTERNS) {
          if (pattern.regex.test(line)) {
            errors.push({
              line: idx + 1,
              type: pattern.type,
              message: pattern.title,
              code: line.trim(),
            });
            stats[pattern.type] = (stats[pattern.type]||0) + 1;
            uniqueErrorTypes.add(pattern.type);
            severityRawScore += SEVERITY_SCORE[pattern.type] || 0;
            if ((SEVERITY_SCORE[pattern.type] || 0) > highestSingle) {
              highestSingle = SEVERITY_SCORE[pattern.type] || 0;
            }
          }
        }
      });
    } else if (
      // Detect common binaries: PDF, Office, etc.
      /\b(pdf|msword|vnd\.openxmlformats|officedocument|excel|xls|doc|ppt|mspowerpoint)\b/i.test(detectedType) ||
      /(\.pdf|\.docx?|\.xlsx?|\.pptx?)$/i.test(originalname)
    ) {
      errors.push({
        line: 0,
        type: "WARNING",
        message: "Binary/Office file uploaded: Deep analysis not yet implemented. File could contain macros or embedded payloads.",
        code: "(binary header not shown)",
      });
      stats.WARNING += 1;
      uniqueErrorTypes.add("WARNING");
      severityRawScore += SEVERITY_SCORE["WARNING"];
      highestSingle = Math.max(highestSingle, SEVERITY_SCORE["WARNING"]);
    }

    let safetyLevel = 'SAFE', threatScore = 0;
    if (errors.length === 0) {
      safetyLevel = 'SAFE';
      threatScore = 0;
    } else {
      threatScore =
        uniqueErrorTypes.size * 2 +
        (stats.DANGER || 0) * 3 +
        (stats.WARNING || 0) +
        Math.ceil((stats.INFO || 0) / 2) +
        highestSingle;
      if (threatScore >= 12) threatScore = 10;
      if (threatScore <= 0) threatScore = 1;
      safetyLevel = getThreatLevel(threatScore);
    }

    // Chart data
    const threatTypes = ['DANGER','WARNING','INFO','SAFE'];
    const chartData = threatTypes.map(type => ({ type, count: stats[type] || 0 }));
    if(errors.length===0) chartData[3].count = 1;

    // **** THIS IS THE CRITICAL FIX ****
    let preview = null;
    if (isText && textLines.length) {
      // Only lines with mostly readable ASCII (not control codes)
      preview = textLines
        .slice(0, 3)
        .map(line => /^[\x20-\x7E\t\r\n]{3,}/.test(line) ? line : '')
        .map(line => line.replace(/\r?\n/, '')).filter(x=>!!x);
      // If all 3 preview lines are blank/unreadable, set to null
      if (!preview.length) preview = null;
    } else {
      preview = null; // For binary/non-text, never send gibberish
    }

    res.json({
      result: `Analysis of '${originalname}' (${detectedType}): ${errors.length} issues found.`,
      summary: {
        fileName: originalname,
        fileType: detectedType,
        totalIssues: errors.length,
        safetyLevel,
        threatScore,
        levelExplanation: (
          safetyLevel === "DANGEROUS"
          ? "Dangerous: File contains high-risk code or signatures."
          : safetyLevel === "WARNING"
          ? "Warning: Suspicious code, risky settings, or possible malware."
          : safetyLevel === "INFO"
          ? "Some not-very-risky issues were found, but no critical threats."
          : "No known issues found. This file appears safe."
        )
      },
      errors,
      chartData,
      preview,
    });

  } catch (err) {
    console.error('Analyze error:', err);
    res.status(500).json({ result: 'Failed to analyze file.' });
  }
});

module.exports = router;
