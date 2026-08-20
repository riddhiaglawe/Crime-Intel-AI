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
import { getStateCollection, isMongoConfigured } from './db.js';

const STATE_ID = process.env.MONGODB_STATE_ID || 'primary';

export function createApiApp() {
  const app = express();
  app.use(express.json({ limit: '64mb' }));

  app.get('/health', async (_req, res) => {
    if (!isMongoConfigured()) {
      return res.json({ ok: true, configured: false, connected: false });
    }
    try {
      const collection = await getStateCollection();
      await collection.findOne({ _id: STATE_ID }, { projection: { _id: 1 } });
      res.json({ ok: true, configured: true, connected: true });
    } catch (err) {
      res.status(503).json({ ok: false, configured: true, connected: false, error: err.message });
    }
  });

  app.get('/state', async (_req, res) => {
    if (!isMongoConfigured()) {
      return res.json({ ok: true, configured: false, data: null });
    }
    try {
      const collection = await getStateCollection();
      const doc = await collection.findOne({ _id: STATE_ID });
      res.json({ ok: true, configured: true, data: doc ? doc.data : null, updatedAt: doc ? doc.updatedAt : null });
    } catch (err) {
      res.status(503).json({ ok: false, configured: true, error: err.message });
    }
  });

  app.put('/state', async (req, res) => {
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
      res.status(503).json({ ok: false, configured: true, error: err.message });
    }
  });

  return app;
}
