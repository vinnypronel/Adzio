const fs = require('fs');
const http = require('http');
const path = require('path');

const root = path.resolve(__dirname, '..');
const host = process.env.HOST || '127.0.0.1';
const port = Number(process.env.PORT || process.argv[2] || 3000);

const contentTypes = {
    '.css': 'text/css; charset=utf-8',
    '.gif': 'image/gif',
    '.html': 'text/html; charset=utf-8',
    '.ico': 'image/x-icon',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.mov': 'video/quicktime',
    '.mp4': 'video/mp4',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
};

function send(res, status, body, type = 'text/plain; charset=utf-8') {
    res.writeHead(status, {
        'Content-Type': type,
        'Cache-Control': 'no-store',
    });
    res.end(body);
}

const server = http.createServer((req, res) => {
    const rawPath = decodeURIComponent((req.url || '/').split('?')[0]);
    const requestPath = rawPath === '/' ? '/index.html' : rawPath;
    const filePath = path.resolve(root, `.${requestPath}`);

    if (!filePath.startsWith(root + path.sep) && filePath !== root) {
        send(res, 403, 'Forbidden');
        return;
    }

    fs.stat(filePath, (statError, stat) => {
        if (statError || !stat.isFile()) {
            send(res, 404, 'Not found');
            return;
        }

        const type = contentTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
        res.writeHead(200, {
            'Content-Type': type,
            'Cache-Control': 'no-store',
        });
        const stream = fs.createReadStream(filePath);
        stream.on('error', () => {
            if (!res.headersSent) send(res, 500, 'Server error');
            else res.destroy();
        });
        stream.pipe(res);
    });
});

server.on('clientError', (error, socket) => {
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});

server.on('error', (error) => {
    console.error(error);
});

server.listen(port, host, () => {
    console.log(`Adzio dev server running at http://${host}:${port}`);
});
