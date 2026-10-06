const http = require('http');
const fs = require('fs');
const path = require('path');
const studentsHandler = require('./api/students');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

function safeJoin(basePath, requestPath) {
  const normalized = path.normalize(requestPath).replace(/^\.+/, '').replace(/^\/+/, '');
  const candidate = path.join(basePath, normalized || 'index.html');
  if (!candidate.startsWith(basePath)) {
    return null;
  }
  return candidate;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');

  if (url.pathname === '/api/students') {
    await studentsHandler(req, res);
    return;
  }

  const incomingPath = url.pathname === '/' ? '/index.html' : url.pathname;
  const safePath = safeJoin(ROOT, incomingPath);
  if (!safePath) {
    res.statusCode = 403;
    res.end('Forbidden');
    return;
  }

  fs.readFile(safePath, (error, file) => {
    if (error) {
      res.statusCode = error.code === 'ENOENT' ? 404 : 500;
      res.end(error.code === 'ENOENT' ? 'Not found' : 'Server error');
      return;
    }

    const ext = path.extname(safePath).toLowerCase();
    const contentTypes = {
      '.html': 'text/html; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.svg': 'image/svg+xml',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.ico': 'image/x-icon',
    };

    res.statusCode = 200;
    res.setHeader('Content-Type', contentTypes[ext] || 'text/plain; charset=utf-8');
    res.end(file);
  });
});

server.listen(PORT, () => {
  console.log(`Local app ready at http://localhost:${PORT}`);
});
