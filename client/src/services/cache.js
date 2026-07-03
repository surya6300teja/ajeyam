// Tiny in-memory, per-session cache for GET responses.
// Makes tab switches / back-navigation instant instead of refetching
// (and re-downloading the base64 cover images) every time.

const store = new Map();
const DEFAULT_TTL = 3 * 60 * 1000; // 3 minutes

export const cacheKey = (url, params = {}) => {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null)
  ).toString();
  return qs ? `${url}?${qs}` : url;
};

// Synchronous peek — returns fresh cached data or null.
export const peekCache = (key, ttl = DEFAULT_TTL) => {
  const entry = store.get(key);
  if (entry && Date.now() - entry.t < ttl) return entry.data;
  return null;
};

export const putCache = (key, data) => {
  store.set(key, { data, t: Date.now() });
};

// Clear the whole cache (e.g. after publishing/editing content).
export const clearCache = () => store.clear();
