import 'server-only';

// Punto unico per la cache persistente.
// - Su Vercel usa la KV collegata (Upstash REST): il dato resta salvato tra le richieste.
// - Se la KV non è configurata (es. sviluppo locale) ripiega su una Map in-memory
//   con scadenza, così l'app funziona comunque senza alcuna configurazione.

const mem = new Map();

function kvConfig() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  return url && token ? { url, token } : null;
}

function memGet(key) {
  const entry = mem.get(key);
  if (!entry) return null;
  if (entry.exp && entry.exp < Date.now()) {
    mem.delete(key);
    return null;
  }
  try {
    return JSON.parse(entry.value);
  } catch {
    return null;
  }
}

function memSet(key, json, ttlSeconds) {
  mem.set(key, {
    value: json,
    exp: ttlSeconds ? Date.now() + ttlSeconds * 1000 : 0,
  });
}

async function upstashFetch(cfg, path, init) {
  const res = await fetch(`${cfg.url}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`KV error ${res.status} on ${path}`);
  return res.json();
}

export async function getJSON(rawKey) {
  const key = `v2:${rawKey}`;
  const cfg = kvConfig();
  if (!cfg) return memGet(key);
  try {
    const data = await upstashFetch(cfg, `/get/${encodeURIComponent(key)}`);
    const raw = data?.result;
    if (raw == null) return null;
    return JSON.parse(raw);
  } catch {
    return memGet(key);
  }
}

export async function setJSON(rawKey, value, ttlSeconds = 3600) {
  const key = `v2:${rawKey}`;
  const json = JSON.stringify(value);
  const cfg = kvConfig();
  if (!cfg) {
    memSet(key, json, ttlSeconds);
    return;
  }
  try {
    // Semantica Upstash REST (verificata empiricamente): il valore è il body crudo,
    // il TTL va nella query (?EX=...). Un body {value, ex} verrebbe salvato per intero
    // e senza scadenza.
    const ttlQuery = ttlSeconds ? `?EX=${ttlSeconds}` : '';
    await upstashFetch(cfg, `/set/${encodeURIComponent(key)}${ttlQuery}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: json,
    });
  } catch {
    memSet(key, json, ttlSeconds);
  }
}