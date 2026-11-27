/*
 * Employee assistant: answers ONLY from approved SOP documents in state.sops. Deterministic keyword
 * retrieval (no LLM in the demo). If nothing relevant is found it says so and routes to the supervisor
 * instead of improvising. Production: embed SOP chunks + an LLM constrained to cite retrieved chunks.
 */
import type { HotelState, Sop, Staff } from "./types";

const norm = (s: string) => s.toLowerCase().replace(/[«»"'.,:;!?()\-–—/]/g, " ").replace(/\s+/g, " ").trim();
const STOP = new Set(["ինչ", "ինչպես", "ինչպե՞ս", "է", "եմ", "ես", "որ", "և", "կամ", "the", "a", "how", "what", "do", "i", "to", "is", "как", "что", "и", "в", "на", "с", "ի", "անել", "պետք", "if", "when", "եթե", "երբ"]);
const tokens = (s: string) => norm(s).split(" ").filter((w) => w.length > 1 && !STOP.has(w));
// light stemming: compare on the first 5 letters so «սենյակի» matches «սենյակ»
const stem = (w: string) => w.slice(0, Math.max(4, Math.min(5, w.length)));

export type SopAnswer =
  | { kind: "answer"; sop: Sop; lines: string[]; score: number; others: Sop[] }
  | { kind: "none"; supervisor: Staff | null };

export function scoreSop(sop: Sop, query: string) {
  const q = tokens(query).map(stem);
  if (!q.length) return 0;
  const tagHits = sop.tags.map((t) => stem(norm(t))).filter((t) => q.includes(t)).length;
  const titleHits = tokens(sop.title).map(stem).filter((t) => q.includes(t)).length;
  const bodyHits = new Set(sop.body.flatMap((b) => tokens(b).map(stem)).filter((t) => q.includes(t))).size;
  return tagHits * 3 + titleHits * 2 + bodyHits;
}

export function askSop(state: HotelState, employee: Staff, query: string): SopAnswer {
  // every approved SOP is readable by staff; the employee's own department ranks first
  const ranked = state.sops
    .map((s) => ({ s, score: scoreSop(s, query) + (s.dept === employee.dept ? 0.5 : 0) }))
    .filter((x) => x.score >= 2)
    .sort((a, b) => b.score - a.score);
  if (!ranked.length) return { kind: "none", supervisor: state.staff.find((x) => x.id === employee.supervisorId) ?? null };
  const best = ranked[0].s;
  const q = tokens(query).map(stem);
  const lines = best.body.filter((b) => tokens(b).map(stem).some((t) => q.includes(t)));
  return { kind: "answer", sop: best, lines: lines.length ? lines : best.body, score: ranked[0].score, others: ranked.slice(1, 3).map((x) => x.s) };
}
