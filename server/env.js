/**
 * Loads .env.local then .env (matching vite's precedence) into process.env,
 * so the server API can read MONGODB_URI in both dev and production.
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

for (const file of ['.env.local', '.env']) {
  dotenv.config({ path: path.join(rootDir, file) });
}
