import "server-only";
/*
 * Shared demo session store.
 *  - On Netlify: Netlify Blobs (strong consistency), one blob per event → no write races.
 *  - Elsewhere (local dev, `next start` on a laptop): in-memory, shared by all devices on that server.
 * A session = { epoch, epochAt, events[] }. Reset starts a new epoch.
 *
 * Shared by all verticals. Each vertical has its own namespace, so hotel and restaurant sessions
 * never mix. The hotel uses the default (empty) namespace, which keeps its original storage names.
 */
import { getStore } from "@netlify/blobs";

/** Minimal shape every stored event has (verticals define the rest). */
export type StampedEvent = { id: string; at: number; by: string; type: string };

export type SessionMeta = { epoch: string; epochAt: number };
export type StoredEvent = { key: string; ev: StampedEvent };

export interface SessionStore {
  backend: "netlify-blobs" | "memory";
  meta(code: string): Promise<SessionMeta>;
  reset(code: string): Promise<SessionMeta>;
  list(code: string, epoch: string, after: string | null): Promise<{ events: StoredEvent[]; count: number }>;
  append(code: string, epoch: string, ev: StampedEvent): Promise<string>;
}

const newMeta = (): SessionMeta => ({ epoch: Math.random().toString(36).slice(2, 10), epochAt: Date.now() });
const eventKey = (ev: StampedEvent) => `${String(Date.now()).padStart(14, "0")}-${ev.id.replace(/[^a-z0-9-]/gi, "").slice(0, 40)}`;

type Mem = Map<string, { meta: SessionMeta; events: StoredEvent[] }>;
const g = globalThis as unknown as { __bosMem?: Mem };

function memoryStore(namespace: string): SessionStore {
  const mem: Mem = (g.__bosMem ??= new Map());
  const k = (code: string) => (namespace ? `${namespace}:${code}` : code);
  const get = (code: string) => {
    let s = mem.get(k(code));
    if (!s) { s = { meta: newMeta(), events: [] }; mem.set(k(code), s); }
    return s;
  };
  return {
    backend: "memory",
    async meta(code) { return get(code).meta; },
    async reset(code) { const s = { meta: newMeta(), events: [] }; mem.set(k(code), s); return s.meta; },
    async list(code, epoch, after) {
      const s = get(code);
      if (s.meta.epoch !== epoch) return { events: [], count: 0 };
      return { events: after ? s.events.filter((e) => e.key > after) : s.events, count: s.events.length };
    },
    async append(code, epoch, ev) {
      const s = get(code);
      if (s.meta.epoch !== epoch) throw new EpochMismatch();
      let key = eventKey(ev);
      const last = s.events[s.events.length - 1]?.key;
      if (last && key <= last) key = `${last}+`; // keep strict order on the same millisecond
      s.events.push({ key, ev });
      return key;
    },
  };
}

function blobStore(namespace: string): SessionStore {
  const context = (process.env.CONTEXT ?? "production").replace(/[^a-z0-9-]/gi, "");
  const store = getStore({ name: `${namespace || "hotel"}-demo-${context}`, consistency: "strong" });
  const metaKey = (code: string) => `${code}/meta`;
  return {
    backend: "netlify-blobs",
    async meta(code) {
      const m = (await store.get(metaKey(code), { type: "json" })) as SessionMeta | null;
      if (m) return m;
      const fresh = newMeta();
      await store.setJSON(metaKey(code), fresh);
      return fresh;
    },
    async reset(code) {
      const fresh = newMeta();
      await store.setJSON(metaKey(code), fresh);
      return fresh;
    },
    async list(code, epoch, after) {
      const { blobs } = await store.list({ prefix: `${code}/${epoch}/` });
      const keys = blobs.map((b) => b.key.slice(`${code}/${epoch}/`.length)).sort();
      const fresh = after ? keys.filter((k) => k > after) : keys;
      const events = await Promise.all(fresh.map(async (k) => ({ key: k, ev: (await store.get(`${code}/${epoch}/${k}`, { type: "json" })) as StampedEvent })));
      return { events: events.filter((e) => e.ev), count: keys.length };
    },
    async append(code, epoch, ev) {
      const m = await this.meta(code);
      if (m.epoch !== epoch) throw new EpochMismatch();
      const key = eventKey(ev);
      await store.setJSON(`${code}/${epoch}/${key}`, ev);
      return key;
    },
  };
}

export class EpochMismatch extends Error {}

const cached = new Map<string, SessionStore>();
/** `namespace` = vertical ("" for the hotel, "restaurant", …). */
export function sessionStore(namespace = ""): SessionStore {
  const hit = cached.get(namespace);
  if (hit) return hit;
  const onNetlify = Boolean(process.env.NETLIFY_BLOBS_CONTEXT || (globalThis as { netlifyBlobsContext?: unknown }).netlifyBlobsContext || process.env.NETLIFY);
  const store = onNetlify ? blobStore(namespace) : memoryStore(namespace);
  cached.set(namespace, store);
  return store;
}
