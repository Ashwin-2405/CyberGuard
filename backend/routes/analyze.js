const express = require('express');
const multer = require('multer');
const fileType = require('file-type'); // npm install file-type
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

// Patterns for threats/warnings/informational issues.
// Extend this list as needed.
const THREAT_PATTERNS = [
  { regex: /\beval\s*\(/gi,           type: "DANGER",    title: "Use of eval()" },
  { regex: /\bexec\s*\(/gi,           type: "DANGER",    title: "Use of exec()" },
  { regex: /os\.system\s*\(/gi,       type: "WARNING",   title: "os.system shell call" },
  { regex: /subprocess\./gi,          type: "WARNING",   title: "Use of subprocess" },
  { regex: /pickle\.load/gi,          type: "WARNING",   title: "Untrusted pickle load" },
  { regex: /input\s*\(/gi,            type: "INFO",      title: "Use of input()" },
  { regex: /import\s+os/gi,           type: "INFO",      title: "Access to OS module" },
  { regex: /import\s+socket/gi,       type: "INFO",      title: "Network usage (socket)" },
  { regex: /<script.*?>/gi,           type: "DANGER",    title: "Embedded script tag" },
  { regex: /macro/i,                  type: "WARNING",   title: "Possible Macro (Office file)" },
  { regex: /password[\s:=]/i,         type: "WARNING",   title: "Looks like hardcoded password" },
  { regex: /base64_decode|atob\(|btoa\(|unescape\(/i, type: "WARNING", title: "Obfuscated string/encoding" },
  // Extend for PDF, Office malware, etc.
];

const SEVERITY_SCORE = {
  'DANGER': 3,
  'WARNING': 2,
  'INFO': 1,
  'SAFE': 0,
};

router.post('/analyze', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ result: 'No file uploaded.' });
    }
    const { originalname, mimetype, buffer } = req.file;

    // Detect file type from buffer (best guess)
    let detectedType = mimetype;
    if (!detectedType || detectedType === 'application/octet-stream') {
      const ft = await fileType.fromBuffer(buffer);
      detectedType = ft ? ft.mime : 'unknown';
    }

    let content = null;
    let textLines = [];
    // Smart detection: treat as text/code if looks like text content, else as binary/doc
    const extension = originalname.split('.').pop()?.toLowerCase() ?? '';
    const probablyText = (
      /^text|json|xml|csv|log|py|js|java|c$|cpp$|sh$|md$|pl$|html|php|bash|shell/i.test(detectedType) ||
      /(\.txt|\.py|\.js|\.php|\.log|\.md|\.sh|\.c|\.cpp|\.json|\.xml|\.csv|\.java|\.pl|\.html)$/i.test(originalname)
    ) || (buffer && buffer.length > 0 && buffer.toString('utf8').replace(/[\x00-\x09\x0B-\x1F\x7F]/g, '').length / buffer.length > 0.9);

    if (probablyText) {
      content = buffer.toString('utf8');
      textLines = content.split(/\r?\n/);
    }

    // Analyze for threats/errors
    const errors = [];
    let severityRawScore = 0;

    if (content && textLines.length) {
      textLines.forEach((line, idx) => {
        THREAT_PATTERNS.forEach(pattern => {
          if (pattern.regex.test(line)) {
            errors.push({
              line: idx + 1,
              type: pattern.type,
              message: pattern.title,
              code: line.trim(),
            });
            severityRawScore += SEVERITY_SCORE[pattern.type] || 0;
          }
        });
      });
    } else if (
      // For common office/pdf types, give a warning (optionally: use PDF/Office parsers)
      /\b(pdf|msword|vnd\.openxmlformats|officedocument|excel|xls|doc|ppt|mspowerpoint)\b/i.test(detectedType) ||
      /(\.pdf|\.docx?|\.xlsx?|\.pptx?)$/i.test(originalname)
    ) {
      errors.push({
        line: 0,
        type: "WARNING",
        message: "Binary/Office file uploaded: Deep analysis not yet implemented. File could contain macros or embedded payloads.",
        code: "(binary header not shown)",
      });
      severityRawScore += 2;
    }

    // Threat/safety "level"
    let safetyLevel = 'SAFE', threatScore = 0;
    if (errors.length === 0) {
      safetyLevel = 'SAFE';
      threatScore = 0;
    } else {
      if (severityRawScore >= 5)      safetyLevel = 'DANGEROUS';
      else if (severityRawScore >= 3) safetyLevel = 'WARNING';
      else if (severityRawScore >= 1) safetyLevel = 'INFO';
      threatScore = Math.min(10, severityRawScore * 2); // 0-10 scale
    }

    // Prepare chart data (guaranteed presence of all keys)
    const threatTypes = ['DANGER','WARNING','INFO','SAFE'];
    const counts = {DANGER:0, WARNING:0, INFO:0, SAFE:0};
    errors.forEach(e => { counts[e.type] = (counts[e.type]||0)+1; });
    if(errors.length===0) counts.SAFE=1;
    const chartData = threatTypes.map(type => ({ type, count: counts[type] }));

    res.json({
      result: `Analysis of '${originalname}' (${detectedType}): ${errors.length} issues found.`,
      summary: {
        fileName: originalname,
        fileType: detectedType,
        totalIssues: errors.length,
        safetyLevel,
        threatScore, // 0=Safe, 1–4=Info, 5–6=Warning, ≥7=Danger
      },
      errors,
      chartData,
      preview: (content && textLines.length) ? textLines.slice(0, 3) : null,
    });
  } catch (err) {
    console.error('Analyze error:', err);
    res.status(500).json({ result: 'Failed to analyze file.' });
  }
});

module.exports = router;
