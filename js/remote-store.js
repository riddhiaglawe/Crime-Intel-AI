/**
 * CrimeIntel AI - MongoDB Atlas sync layer.
 *
 * Mirrors the same state object the app already keeps in localStorage to the
 * server-side Atlas collection. LocalStorage stays in place as an offline
 * cache so the UI behaves exactly as before when the database is unreachable.
 */

const STATE_ENDPOINT = '/api/state';
const SAVE_DEBOUNCE_MS = 400;

let remoteAvailable = false;
let pendingTimer = null;
let pendingData = null;
let inFlight = Promise.resolve();

export function isRemoteAvailable() {
  return remoteAvailable;
}

export async function fetchRemoteState() {
  try {
    const res = await fetch(STATE_ENDPOINT, { headers: { Accept: 'application/json' } });
    if (!res.ok) {
      remoteAvailable = false;
      return null;
    }
    const payload = await res.json();
    remoteAvailable = Boolean(payload && payload.configured);
    return remoteAvailable && payload.data ? payload.data : null;
  } catch (err) {
    remoteAvailable = false;
    console.warn('Atlas read unavailable, using local cache', err);
    return null;
  }
}

async function sendState(data) {
  try {
    const res = await fetch(STATE_ENDPOINT, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data })
    });
    if (!res.ok) {
      remoteAvailable = false;
      return false;
    }
    const payload = await res.json();
    remoteAvailable = Boolean(payload && payload.configured);
    return remoteAvailable;
  } catch (err) {
    remoteAvailable = false;
    console.warn('Atlas write failed, kept local copy', err);
    return false;
  }
}

export function saveRemoteState(data) {
  pendingData = data;
  if (pendingTimer) clearTimeout(pendingTimer);

  return new Promise(resolve => {
    pendingTimer = setTimeout(() => {
      pendingTimer = null;
      const snapshot = pendingData;
      pendingData = null;
      inFlight = inFlight.then(() => sendState(snapshot)).then(resolve, resolve);
    }, SAVE_DEBOUNCE_MS);
  });
}

export function flushRemoteState() {
  if (pendingTimer) {
    clearTimeout(pendingTimer);
    pendingTimer = null;
    const snapshot = pendingData;
    pendingData = null;
    if (snapshot) {
      inFlight = inFlight.then(() => sendState(snapshot));
    }
  }
  return inFlight;
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => { flushRemoteState(); });
}
