/**
 * Central API Utility for AIESEC Dashboard
 * Handles base URL, query parameters, and unified error logging.
 */

const DEFAULT_API_URL = 'http://localhost:4000';

const apiCache = new Map();

export async function fetchApi(endpoint, params = {}) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL;

  // Clean up endpoint prefix
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = new URL(`${baseUrl}${cleanEndpoint}`);

  // Append query parameters
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.append(key, value);
    }
  });

  const cacheKey = url.toString();

  // Return cached data if available
  if (apiCache.has(cacheKey)) {
    return apiCache.get(cacheKey);
  }

  try {
    const response = await fetch(cacheKey, {
      // We manage our own in-memory cache for the session
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.error || `API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Store in cache
    apiCache.set(cacheKey, data);

    return data;
  } catch (error) {
    console.error(`[API Fetch Error] ${cacheKey}:`, error);
    throw error;
  }
}
