import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { handleComponents } from './routes/components.js';
import { handleAuth } from './routes/auth.js';
import { handleUsers } from './routes/users.js';
import { handleLocales } from './routes/locales.js';

const PORT = process.env.PORT || 3000;


function parseBody(req) {
    return new Promise(function(resolve) {
        let body = '';
        req.on('data', function(chunk) { body += chunk; });
        req.on('end', function() {
            try { resolve(JSON.parse(body)); }
            catch (e) { resolve(null); }
        });
    });
}


function cors(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}


function json(res, statusCode, data) {
    cors(res);
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
}


function notFound(res) {
    json(res, 404, { error: 'not found' });
}


const server = http.createServer(async function(req, res) {

    cors(res);

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const url = new URL(req.url, `http://localhost:${PORT}`);
    const pathname = url.pathname;

    console.log(`${req.method} ${pathname}`);

    if (pathname.startsWith('/api/components')) {
        return handleComponents(req, res, pathname, json);
    }

    if (pathname.startsWith('/api/auth')) {
        const body = await parseBody(req);
        return handleAuth(req, res, pathname, body, json);
    }

    if (pathname.startsWith('/api/users')) {
        const body = await parseBody(req);
        return handleUsers(req, res, pathname, url, body, json);
    }

    if (pathname.startsWith('/api/locales')) {
        return handleLocales(req, res, pathname, json);
    }

    notFound(res);
});


server.listen(PORT, function() {
    console.log(`Mock server running at http://localhost:${PORT}`);
});
