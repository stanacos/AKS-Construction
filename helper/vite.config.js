import fs from 'node:fs/promises';
import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const SCRIPTS_DIR = path.resolve(__dirname, '..', 'scripts');
const MAX_BODY_BYTES = 5 * 1024 * 1024;

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let totalBytes = 0;

    req.on('data', (chunk) => {
      totalBytes += chunk.length;
      if (totalBytes > MAX_BODY_BYTES) {
        reject(new Error('Request body too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error('Invalid JSON body'));
      }
    });

    req.on('error', (error) => reject(error));
  });
}

function saveScriptMiddleware() {
  return {
    name: 'save-script-middleware',
    configureServer(server) {
      // Existing tests navigate to /AKS-Construction (without trailing slash).
      // Normalize it to Vite's base path entrypoint.
      server.middlewares.use((req, res, next) => {
        const url = req.url ?? '';
        if (url === '/AKS-Construction' || url.startsWith('/AKS-Construction?')) {
          const query = url.includes('?') ? url.slice(url.indexOf('?')) : '';
          res.statusCode = 302;
          res.setHeader('Location', `/AKS-Construction/${query}`);
          res.end();
          return;
        }
        next();
      });

      server.middlewares.use('/api/save-script', async (req, res) => {
        if (req.method !== 'POST') {
          sendJson(res, 405, { error: 'Only POST is supported' });
          return;
        }

        try {
          const { filename, content } = await readRequestBody(req);

          if (!filename || typeof filename !== 'string' || typeof content !== 'string') {
            sendJson(res, 400, { error: 'filename and content are required' });
            return;
          }

          const safeName = path.basename(filename);
          if (!safeName) {
            sendJson(res, 400, { error: 'filename is invalid' });
            return;
          }

          await fs.mkdir(SCRIPTS_DIR, { recursive: true });

          const filePath = path.join(SCRIPTS_DIR, safeName);
          await fs.writeFile(filePath, content, 'utf8');

          if (safeName.endsWith('.sh')) {
            await fs.chmod(filePath, 0o755);
          }

          sendJson(res, 200, { success: true, path: `scripts/${safeName}` });
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          const statusCode =
            message === 'Invalid JSON body' || message === 'Request body too large' ? 400 : 500;
          console.error('[vite.save-script] Failed to save script:', error);
          sendJson(res, statusCode, { error: 'failed to save script' });
        }
      });
    },
  };
}

export default defineConfig({
  base: '/AKS-Construction/',
  plugins: [react(), saveScriptMiddleware()],
  server: {
    port: 3000,
  },
  build: {
    outDir: 'build',
  },
});
