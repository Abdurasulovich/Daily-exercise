// Minimal promise wrapper around IndexedDB with versioned schema migrations.
//
// To change the schema later: bump DB_VERSION and add MIGRATIONS[newVersion].
// Each migration receives (db, tx) inside the versionchange transaction, so it can
// create stores/indexes and rewrite existing records before the app sees them.

export const DB_NAME = 'mashq-kundaligi';
export const DB_VERSION = 1;
export const STORES = ['exercises', 'plan', 'sessions', 'bodyWeights', 'settings'];

const MIGRATIONS = {
  1(db) {
    db.createObjectStore('exercises', { keyPath: 'id' });
    db.createObjectStore('plan', { keyPath: 'day' });
    db.createObjectStore('sessions', { keyPath: 'date' });
    db.createObjectStore('bodyWeights', { keyPath: 'date' });
    db.createObjectStore('settings', { keyPath: 'key' });
  },
  // 2(db, tx) { ...example: tx.objectStore('sessions').createIndex('byType', 'type'); }
};

let dbPromise;

export function openDB() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = req.result;
      for (let v = e.oldVersion + 1; v <= DB_VERSION; v++) MIGRATIONS[v]?.(db, req.transaction);
    };
    req.onsuccess = () => {
      const db = req.result;
      // Another tab opened a newer version: close so its upgrade can proceed.
      db.onversionchange = () => { db.close(); location.reload(); };
      resolve(db);
    };
    req.onerror = () => reject(req.error);
    req.onblocked = () => console.warn('IndexedDB upgrade blocked by another tab');
  });
  return dbPromise;
}

const wrap = (req) => new Promise((res, rej) => { req.onsuccess = () => res(req.result); req.onerror = () => rej(req.error); });
const done = (tx) => new Promise((res, rej) => { tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); tx.onabort = () => rej(tx.error); });

async function store(name, mode = 'readonly') {
  const db = await openDB();
  return db.transaction(name, mode).objectStore(name);
}

export const db = {
  async get(name, key) { return wrap((await store(name)).get(key)); },
  async all(name) { return wrap((await store(name)).getAll()); },
  async put(name, value) {
    const s = await store(name, 'readwrite');
    await wrap(s.put(value));
    return done(s.transaction);
  },
  async putMany(name, values) {
    const s = await store(name, 'readwrite');
    for (const v of values) s.put(v);
    return done(s.transaction);
  },
  async del(name, key) {
    const s = await store(name, 'readwrite');
    s.delete(key);
    return done(s.transaction);
  },
  /** Sessions in a date range (inclusive), sorted by date. */
  async range(name, from, to) {
    return wrap((await store(name)).getAll(IDBKeyRange.bound(from, to)));
  },
  /** Replace the contents of all stores atomically. */
  async replaceAll(data) {
    const dbi = await openDB();
    const tx = dbi.transaction(STORES, 'readwrite');
    for (const name of STORES) {
      const s = tx.objectStore(name);
      s.clear();
      for (const v of data[name] || []) s.put(v);
    }
    return done(tx);
  },
  async dump() {
    const out = {};
    for (const name of STORES) out[name] = await this.all(name);
    return out;
  },
};

// ---- settings helpers ----
export async function getSetting(key, fallback = null) {
  const row = await db.get('settings', key);
  return row ? row.value : fallback;
}
export const setSetting = (key, value) => db.put('settings', { key, value });
export async function getSettings(defaults) {
  const rows = await db.all('settings');
  const out = { ...defaults };
  for (const r of rows) out[r.key] = r.value;
  return out;
}
