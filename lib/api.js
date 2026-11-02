/**
 * Central API utility for the AIESEC dashboard.
 * Handles base URL, query parameters, short-lived caching and error logging.
 */

// Must match the backend's PORT (see mkt-tracker-backend/server.js).
const DEFAULT_API_URL = 'http://localhost:4000';

/**
 * Entries expire. The previous implementation kept a permanent Map, which on
 * the server survived for the lifetime of the Node process — so every page
 * served the first response it ever fetched, for ever, while the UI showed a
 * "Live" badge. The backend already caches for 60s; this just avoids
 * hammering it within a single interaction.
 */
const CACHE_TTL_MS = Number(process.env.NEXT_PUBLIC_API_CACHE_MS || 30_000);

const apiCache = new Map(); // key -> { expires, data }
const inFlight = new Map(); // key -> Promise, dedupes concurrent identical calls

export function clearApiCache() {
  apiCache.clear();
  inFlight.clear();
}

function readCache(key) {
  const hit = apiCache.get(key);
  if (!hit) return undefined;
  if (hit.expires <= Date.now()) {
    apiCache.delete(key);
    return undefined;
  }
  return hit.data;
}

export async function fetchApi(endpoint, params = {}, options = {}) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = new URL(`${baseUrl}${cleanEndpoint}`);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.append(key, value);
    }
  });

  const cacheKey = url.toString();

  if (!options.force) {
    const cached = readCache(cacheKey);
    if (cached !== undefined) return cached;

    const pending = inFlight.get(cacheKey);
    if (pending) return pending;
  }

  const headers = { Accept: 'application/json' };
  const token = process.env.API_TOKEN || process.env.NEXT_PUBLIC_API_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;

  const request = (async () => {
    try {
      const response = await fetch(cacheKey, { cache: 'no-store', headers });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.error || `API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      apiCache.set(cacheKey, { expires: Date.now() + CACHE_TTL_MS, data });
      return data;
    } catch (error) {
      console.error(`[API Fetch Error] ${cacheKey}:`, error);
      throw error;
    } finally {
      inFlight.delete(cacheKey);
    }
  })();

  inFlight.set(cacheKey, request);
  return request;
}
