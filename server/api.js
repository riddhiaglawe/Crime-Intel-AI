/**
 * State API backed by MongoDB Atlas.
 *
 * GET  /api/state   -> { ok, configured, data }   (data is null when nothing stored yet)
 * PUT  /api/state   -> { ok, updatedAt }
 * GET  /api/health  -> { ok, configured, connected }
 *
 * The browser keeps using the exact same data shape it previously wrote to
 * localStorage; this endpoint just mirrors that document into Atlas.
 */

import express from 'express';
import rateLimit from 'express-rate-limit';
import { getStateCollection, isMongoConfigured } from './db.js';
import { suggestLegalProvisions, VERIFIED_LEGAL_DATASET } from './legal-analyzer.js';

const STATE_ID = process.env.MONGODB_STATE_ID || 'primary';
const API_SECRET = process.env.VITE_API_SECRET || '';

// Rate limiting middleware to prevent abuse & denial of service
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150, // Limit each IP to 150 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: 'Too many requests from this IP, please try again later.' }
});

let loggedWarning = false;

// Middleware to authenticate API requests via shared token
function authenticateApi(req, res, next) {
  if (!API_SECRET) {
    if (!loggedWarning) {
      console.warn('SECURITY WARNING: VITE_API_SECRET is not configured in the environment. Running in public mode.');
      loggedWarning = true;
    }
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${API_SECRET}`) {
    return res.status(401).json({ ok: false, error: 'Unauthorized: Invalid or missing API secret.' });
  }
  next();
}

/**
 * Role-based authorization middleware:
 * Enforces that only Police Officers can access advisory legal suggestions.
 */
function requirePoliceRole(req, res, next) {
  const userRole = req.headers['x-user-role'] || (req.body && req.body.userRole) || '';
  if (userRole.toLowerCase() !== 'police officer') {
    return res.status(403).json({
      ok: false,
      error: 'Access Restricted: Suggested legal provisions are advisory decision-support tools for authorized Law Enforcement Officers only.'
    });
  }
  next();
}

export function createApiApp() {
  const app = express();
  app.use(express.json({ limit: '64mb' }));
  app.use(apiLimiter);

  app.get('/health', async (_req, res) => {
    if (!isMongoConfigured()) {
      return res.json({ ok: true, configured: false, connected: false });
    }
    try {
      const collection = await getStateCollection();
      await collection.findOne({ _id: STATE_ID }, { projection: { _id: 1 } });
      res.json({ ok: true, configured: true, connected: true });
    } catch (err) {
      console.error('Database health check failed:', err);
      res.status(503).json({ ok: false, configured: true, connected: false, error: 'Database service unavailable' });
    }
  });

  app.get('/state', authenticateApi, async (_req, res) => {
    if (!isMongoConfigured()) {
      return res.json({ ok: true, configured: false, data: null });
    }
    try {
      const collection = await getStateCollection();
      const doc = await collection.findOne({ _id: STATE_ID });
      res.json({ ok: true, configured: true, data: doc ? doc.data : null, updatedAt: doc ? doc.updatedAt : null });
    } catch (err) {
      console.error('Database read state failed:', err);
      res.status(503).json({ ok: false, configured: true, error: 'Database read service unavailable' });
    }
  });

  app.put('/state', authenticateApi, async (req, res) => {
    const data = req.body && req.body.data;
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ ok: false, error: 'Body must be { data: <object> }' });
    }
    if (!isMongoConfigured()) {
      return res.json({ ok: true, configured: false });
    }
    try {
      const collection = await getStateCollection();
      const updatedAt = new Date().toISOString();
      await collection.updateOne(
        { _id: STATE_ID },
        { $set: { data, updatedAt } },
        { upsert: true }
      );
      res.json({ ok: true, configured: true, updatedAt });
    } catch (err) {
      console.error('Database write state failed:', err);
      res.status(503).json({ ok: false, configured: true, error: 'Database write service unavailable' });
    }
  });

  /**
   * Advisory Legal Provisions Analysis Endpoint.
   * Strictly restricted to authorized Police Officers.
   */
  app.post('/suggest-legal-provisions', requirePoliceRole, async (req, res) => {
    const complaintData = req.body && req.body.complaint;
    if (!complaintData || typeof complaintData !== 'object') {
      return res.status(400).json({ ok: false, error: 'Missing complaint payload' });
    }

    try {
      const result = await suggestLegalProvisions(complaintData);
      res.json({
        ok: true,
        source: result.source,
        disclaimer: 'Advisory decision-support only. Not an official FIR or final charge. Final legal classification remains with the authorized police authority.',
        provisions: result.provisions
      });
    } catch (err) {
      console.error('Legal suggestion analysis error:', err);
      res.json({
        ok: true,
        fallback: true,
        message: 'Legal suggestion service temporarily unavailable. Manual review required.',
        provisions: [
          {
            id: `lp_err_${Date.now()}`,
            sno: 1,
            act: 'Manual Review',
            section: 'Manual police/legal review required.',
            offence: 'Under Investigation',
            reason: 'Legal suggestion service temporarily unavailable. Manual review required.',
            relevance: 'Medium',
            decision: 'Pending',
            officerRemarks: '',
            reviewedBy: null,
            officerId: null,
            reviewedAt: null
          }
        ]
      });
    }
  });

  /**
   * Reference BNS 2023 dataset endpoint (Police only)
   */
  app.get('/legal-reference-dataset', requirePoliceRole, (_req, res) => {
    res.json({
      ok: true,
      count: VERIFIED_LEGAL_DATASET.length,
      dataset: VERIFIED_LEGAL_DATASET
    });
  });

  return app;
}
