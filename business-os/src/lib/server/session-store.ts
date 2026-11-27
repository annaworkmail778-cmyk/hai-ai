import "server-only";
/*
 * Shared demo session store.
 *  - On Netlify: Netlify Blobs (strong consistency), one blob per event → no write races.
 *  - Elsewhere (local dev, `next start` on a laptop): in-memory, shared by all devices on that server.
 * A session = { epoch, epochAt, events[] }. Reset starts a new epoch.
 */
import { getStore } from "@netlify/blobs";
import type { StampedEvent } from "../types.ts";

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

function memoryStore(): SessionStore {
  const mem: Mem = (g.__bosMem ??= new Map());
  const get = (code: string) => {
    let s = mem.get(code);
    if (!s) { s = { meta: newMeta(), events: [] }; mem.set(code, s); }
    return s;
  };
  return {
    backend: "memory",
    async meta(code) { return get(code).meta; },
    async reset(code) { const s = { meta: newMeta(), events: [] }; mem.set(code, s); return s.meta; },
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

function blobStore(): SessionStore {
  const context = (process.env.CONTEXT ?? "production").replace(/[^a-z0-9-]/gi, "");
  const store = getStore({ name: `hotel-demo-${context}`, consistency: "strong" });
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

let cached: SessionStore | null = null;
export function sessionStore(): SessionStore {
  if (cached) return cached;
  const onNetlify = Boolean(process.env.NETLIFY_BLOBS_CONTEXT || (globalThis as { netlifyBlobsContext?: unknown }).netlifyBlobsContext || process.env.NETLIFY);
  cached = onNetlify ? blobStore() : memoryStore();
  return cached;
}
