// backend/src/server.ts
import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { Server } from 'http';
import { createRoutes } from './routes';

const PORT = Number(process.env.PORT || 8080);

async function main() {
  const app = express();
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: '1mb' }));

  // --- Health endpoint ---
  app.get('/healthz', (_req, res) => res.json({ ok: true }));

  // --- API routes ---
  createRoutes(app); // mounts under /api/v1

  // --- Dynamic env-config.json endpoint ---
  app.get('/env-config.json', (_req, res) => {
    res.json({
      BACKEND_URL: process.env.BACKEND_URL ?? '',
      // MAPS_API_KEY: process.env.MAPS_API_KEY ?? ''
    });
  });

  // --- Static frontend serving ---
  const publicDir = path.join(__dirname, '../public');
  const fallbackDist = path.join(__dirname, '../../frontend/dist');
  const clientDir = fs.existsSync(publicDir) ? publicDir : fallbackDist;

  if (fs.existsSync(clientDir)) {
    app.use(express.static(clientDir));

    // Catch-all: serve index.html for all non-API, non-health, non-env requests
    app.get(/^(?!(?:\/api\/|\/healthz$|\/env-config\.json$)).*/, (req, res) => {
      res.sendFile(path.join(clientDir, 'index.html'));
    });
  } else {
    console.warn(
      `[WARN] No frontend build found at ${clientDir}. "/" will not serve the app until you build.`
    );
  }

  // --- Central error handler ---
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = Number(err?.statusCode || err?.status || 500);
    const message =
      typeof err?.message === 'string' ? err.message : 'Internal Server Error';
    if (status >= 500) console.error('[ERROR]', err);
    res.status(status).json({ error: message });
  });

  // --- Start server ---
  const server: Server = app.listen(PORT, () => {
    console.log(`✅ API listening on http://localhost:${PORT}`);
    if (fs.existsSync(clientDir)) {
      console.log(`✅ Frontend served from: ${clientDir}`);
      console.log(`➡  Open http://localhost:${PORT} to view the app`);
    }
  });

  // --- Graceful shutdown ---
  const shutdown = (signal: string) => {
    console.log(`\n${signal} received: closing server...`);
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 5000);
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((err) => {
  console.error('❌ Failed to start server', err);
  process.exit(1);
});
