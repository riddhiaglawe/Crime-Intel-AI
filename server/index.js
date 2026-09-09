/**
 * Production server: serves the built app plus the MongoDB Atlas state API.
 * During `npm run dev` the same API is mounted by vite.config.ts, so the
 * frontend behaves identically in both modes.
 */

import './env.js';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import cors from 'cors';
import { createApiApp } from './api.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const port = Number(process.env.PORT || 3000);

// Handle uncaught exceptions and rejections to prevent process crashes (502 Bad Gateway)
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Promise Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

const app = express();

// Secure application with HTTP security headers and custom CSP
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdnjs.cloudflare.com"],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'", "https://fonts.googleapis.com", "https://fonts.gstatic.com"]
    }
  }
}));

// Enable CORS safely
app.use(cors());

// Root healthcheck ping for Render load balancers
app.get('/healthz', (_req, res) => res.status(200).json({ ok: true }));

app.use('/api', createApiApp());
app.use(express.static(distDir));
app.get('*', (_req, res) => res.sendFile(path.join(distDir, 'index.html')));

const server = app.listen(port, '0.0.0.0', () => {
  console.log(`CrimeIntel AI server listening on http://0.0.0.0:${port}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated.');
  });
});

