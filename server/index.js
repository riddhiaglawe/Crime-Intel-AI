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

const app = express();

// Secure application with HTTP security headers and custom CSP
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'", "https://fonts.googleapis.com", "https://fonts.gstatic.com"]
    }
  }
}));

// Enable CORS safely
app.use(cors());

app.use('/api', createApiApp());
app.use(express.static(distDir));
app.get('*', (_req, res) => res.sendFile(path.join(distDir, 'index.html')));

app.listen(port, '0.0.0.0', () => {
  console.log(`CrimeIntel AI server listening on http://0.0.0.0:${port}`);
});
