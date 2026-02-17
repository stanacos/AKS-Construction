const fs = require('fs');
const path = require('path');

module.exports = function (app) {
  // Resolve <project-root>/scripts/
  const scriptsDir = path.resolve(__dirname, '..', '..', '..', 'scripts');

  app.use('/api/save-script', require('express').json());

  app.post('/api/save-script', (req, res) => {
    const { filename, content } = req.body;

    if (!filename || typeof content !== 'string') {
      return res.status(400).json({ error: 'filename and content are required' });
    }

    // Prevent path traversal — only allow the basename
    const safeName = path.basename(filename);

    // Create scripts/ dir if missing
    if (!fs.existsSync(scriptsDir)) {
      fs.mkdirSync(scriptsDir, { recursive: true });
    }

    const filePath = path.join(scriptsDir, safeName);
    fs.writeFileSync(filePath, content, 'utf8');

    // Make .sh files executable
    if (safeName.endsWith('.sh')) {
      fs.chmodSync(filePath, 0o755);
    }

    res.json({ success: true, path: `scripts/${safeName}` });
  });
};
