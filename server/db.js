/**
 * MongoDB Atlas connection helper.
 * A single client is reused across requests (recommended by the driver).
 */

import { MongoClient } from 'mongodb';

const DEFAULT_DB_NAME = 'crimeintel';
const DEFAULT_COLLECTION = 'app_state';

let clientPromise = null;

export function getMongoUri() {
  return process.env.MONGODB_URI || process.env.MONGO_URL || '';
}

export function isMongoConfigured() {
  return Boolean(getMongoUri());
}

export function getStateCollection() {
  const uri = getMongoUri();
  if (!uri) {
    return Promise.reject(new Error('MONGODB_URI is not configured'));
  }

  if (!clientPromise) {
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 15000,
      retryWrites: true
    });
    clientPromise = client.connect().catch(err => {
      clientPromise = null;
      throw err;
    });
  }

  const dbName = process.env.MONGODB_DB || DEFAULT_DB_NAME;
  const collectionName = process.env.MONGODB_COLLECTION || DEFAULT_COLLECTION;

  return clientPromise.then(client => client.db(dbName).collection(collectionName));
}
