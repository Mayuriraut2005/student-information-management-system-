const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5500;
const FRONTEND_DIR = path.join(__dirname, 'frontend');

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];

  // Strip leading /frontend prefix if present (e.g. from VS Code Live Server paths)
  if (reqPath.startsWith('/frontend/')) {
    reqPath = reqPath.slice('/frontend'.length);
  } else if (reqPath === '/frontend') {
    reqPath = '/index.html';
  }

  if (reqPath === '/' || reqPath === '') {
    reqPath = '/index.html';
  }

  // Handle clean URLs
  let filePath = path.join(FRONTEND_DIR, reqPath);
  if (!fs.existsSync(filePath) && fs.existsSync(filePath + '.html')) {
    filePath += '.html';
  }

  // Prevent path traversal
  if (!filePath.startsWith(FRONTEND_DIR)) {
    res.writeHead(403);
    res.end('Access Denied');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
    });

    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[Frontend Server] Presentation Tier running at: http://127.0.0.1:${PORT}`);
  console.log(`[Frontend Server] Ready for VS Code Live Server paths: http://127.0.0.1:${PORT}/frontend/index.html`);
});
