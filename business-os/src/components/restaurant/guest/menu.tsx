"use client";
/* Digital menu: categories, search, dish sheet with modifier rules, device cart. Shared by QR (table) and takeaway modes. */
import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { Icon } from "@/components/icons";
import { cn } from "@/components/ui";
import { useR } from "@/lib/restaurant/client";
import { ALLERGEN, t } from "@/lib/restaurant/i18n";
import { cartLinePrice, modifierError } from "@/lib/restaurant/rules";
import type { CartLine, Lang, MenuItem } from "@/lib/restaurant/types";
import { money } from "./shell";

export function DishPhoto({ item, sizes, className }: { item: MenuItem; sizes: string; className?: string }) {
  if (item.photo) return <Image src={item.photo} alt="" fill sizes={sizes} className={cn("object-cover", className)} />;
  return (
    <div className={cn("absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_30%_20%,color-mix(in_srgb,var(--rt-accent)_28%,transparent),transparent_60%),var(--rt-bg-2)]", className)}>
      <span className="rt-serif px-4 text-center text-[20px] leading-tight text-[var(--rt-muted)]">{item.name.en}</span>
    </div>
  );
}

function Tags({ item, lang }: { item: MenuItem; lang: Lang }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {item.tags.includes("signature") && <span className="rt-chip border-[var(--rt-gold)] text-[var(--rt-gold)]">{t("signatureTag", lang)}</span>}
      {item.tags.includes("chef") && <span className="rt-chip border-[var(--rt-accent)] text-[var(--rt-accent)]">{t("chef", lang)}</span>}
      {item.tags.includes("new") && <span className="rt-chip">{t("newTag", lang)}</span>}
      {item.dietary.map((d) => <span key={d} className="rt-chip">{t(d, lang)}</span>)}
    </div>
  );
}

export function DishSheet({ item, lang, onClose, onAdd }: { item: MenuItem; lang: Lang; onClose: () => void; onAdd: (l: CartLine) => void }) {
  const [mods, setMods] = useState<string[]>([]);
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const err = modifierError(item, mods);
  const price = cartLinePrice(item, mods) * qty;
  const toggle = (gid: string, oid: string) => {
    const g = item.groups.find((x) => x.id === gid)!;
    const inGroup = g.options.map((o) => o.id);
    const has = mods.includes(oid);
    if (g.max === 1) setMods([...mods.filter((m) => !inGroup.includes(m)), ...(has && g.min === 0 ? [] : [oid])]);
    else if (has) setMods(mods.filter((m) => m !== oid));
    else if (mods.filter((m) => inGroup.includes(m)).length < g.max) setMods([...mods, oid]);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label={item.name[lang]}>
      <div className="rt-fade absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="rt-sheet relative flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-[28px] bg-[var(--rt-bg)] sm:rounded-[28px]">
        <div className="relative h-60 shrink-0 sm:h-72"><DishPhoto item={item} sizes="(min-width: 640px) 512px, 100vw" /><div className="absolute inset-0 bg-gradient-to-t from-[var(--rt-bg)] via-transparent to-transparent" /></div>
        <button onClick={onClose} className="absolute right-3 top-3 grid size-10 place-items-center rounded-full bg-black/50 text-white backdrop-blur" aria-label={t("back", lang)}><Icon name="x" size={18} /></button>
        <div className="-mt-10 flex-1 overflow-y-auto px-5 pb-4">
          <div className="relative">
            <h2 className="rt-serif text-[30px] leading-tight">{item.name[lang]}</h2>
            <p className="mt-1 text-[15px] text-[var(--rt-muted)]">{item.desc[lang]}</p>
            <div className="mt-3"><Tags item={item} lang={lang} /></div>
          </div>
          <div className="mt-5 grid gap-3 text-[13.5px]">
            <div><div className="mb-1 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-[var(--rt-faint)]">{t("ingredients", lang)}</div><div className="text-[var(--rt-muted)]">{item.ingredientsText[lang]}</div></div>
            <div>
              <div className="mb-1 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-[var(--rt-faint)]">{t("allergens", lang)}</div>
              {!item.allergensVerified ? <div className="flex items-start gap-2 text-[var(--rt-gold)]"><Icon name="alert" size={16} className="mt-0.5 shrink-0" />{t("allergensNotProvided", lang)}</div>
                : item.allergens.length ? <div className="flex flex-wrap gap-1.5">{item.allergens.map((a) => <span key={a} className="rt-chip border-[var(--rt-gold)] text-[var(--rt-text)]">{ALLERGEN[a][lang]}</span>)}</div>
                : <div className="text-[var(--rt-muted)]">{t("noAllergens", lang)}</div>}
              <p className="mt-1.5 text-[12px] text-[var(--rt-faint)]">{t("allergyNote", lang)}</p>
            </div>
          </div>
          {item.groups.map((g) => (
            <fieldset key={g.id} className="mt-5">
              <legend className="mb-2 flex w-full items-center justify-between text-[14px] font-semibold"><span>{g.name[lang]}</span><span className="text-[12px] font-normal text-[var(--rt-faint)]">{g.min > 0 ? t("required", lang) : `${t("optional", lang)}${g.max > 1 ? ` · ${t("upTo", lang)} ${g.max}` : ""}`}</span></legend>
              <div className="grid gap-2">
                {g.options.map((o) => {
                  const on = mods.includes(o.id);
                  return (
                    <button key={o.id} type="button" onClick={() => toggle(g.id, o.id)} aria-pressed={on} className={cn("flex min-h-12 items-center gap-3 rounded-2xl border px-4 text-left text-[15px] transition", on ? "border-[var(--rt-accent)] bg-[color-mix(in_srgb,var(--rt-accent)_12%,transparent)]" : "border-[var(--rt-line)]")}>
                      <span className={cn("grid size-5 shrink-0 place-items-center border-2", g.max === 1 ? "rounded-full" : "rounded-md", on ? "border-[var(--rt-accent)] bg-[var(--rt-accent)] text-[var(--rt-accent-ink)]" : "border-[var(--rt-faint)]")}>{on && <Icon name="check" size={12} />}</span>
                      <span className="flex-1">{o.name[lang]}</span>
                      {o.price > 0 && <span className="tnum text-[var(--rt-muted)]">+{money(o.price)}</span>}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ))}
          <label className="mt-5 block"><span className="mb-1.5 block text-[14px] font-semibold">{t("note", lang)}</span><input className="rt-input" maxLength={120} value={note} onChange={(e) => setNote(e.target.value)} placeholder="…" /></label>
        </div>
        <div className="flex items-center gap-3 border-t border-[var(--rt-line)] p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="flex items-center rounded-full border border-[var(--rt-line)]">
            <button className="grid size-11 place-items-center text-[20px]" onClick={() => setQty(Math.max(1, qty - 1))} aria-label="−">−</button>
            <span className="tnum w-6 text-center font-semibold">{qty}</span>
            <button className="grid size-11 place-items-center text-[20px]" onClick={() => setQty(Math.min(20, qty + 1))} aria-label="+">+</button>
          </div>
          <button className="rt-btn rt-btn-accent flex-1" disabled={Boolean(err)} onClick={() => { onAdd({ itemId: item.id, qty, modifierIds: mods, note: note.trim() }); onClose(); }}>
            {t("addToOrder", lang)} · <span className="tnum">{money(price)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function MenuBrowser({ lang, onAdd, header }: { lang: Lang; onAdd: (l: CartLine) => void; header?: React.ReactNode }) {
  const { state } = useR();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<MenuItem | null>(null);
  const [active, setActive] = useState(state.categories[0].id);
  const sections = useRef<Record<string, HTMLElement | null>>({});
  const items = useMemo(() => {
    const k = q.trim().toLowerCase();
    return state.items.filter((i) => !k || [i.name.hy, i.name.ru, i.name.en, i.desc[lang], i.ingredientsText[lang]].some((x) => x.toLowerCase().includes(k)));
  }, [state.items, q, lang]);
  const go = (id: string) => { setActive(id as typeof active); sections.current[id]?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" }); };
  return (
    <div>
      {header}
      <div className="sticky top-16 z-20 border-b border-[var(--rt-line)] bg-[color-mix(in_srgb,var(--rt-bg)_92%,transparent)] backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 pt-3">
          <label className="relative block"><Icon name="search" size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--rt-faint)]" /><input className="rt-input pl-11" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("search", lang)} aria-label={t("search", lang)} /></label>
          <div className="rt-noscroll -mx-4 mt-2 flex gap-2 overflow-x-auto px-4 pb-3">
            {state.categories.filter((c) => items.some((i) => i.categoryId === c.id)).map((c) => (
              <button key={c.id} onClick={() => go(c.id)} className={cn("h-9 shrink-0 rounded-full border px-4 text-[13.5px] font-medium", active === c.id ? "border-[var(--rt-text)] bg-[var(--rt-text)] text-[var(--rt-bg)]" : "border-[var(--rt-line)] text-[var(--rt-muted)]")}>{c.name[lang]}</button>
            ))}
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-5xl px-4 pb-36">
        {state.categories.map((c) => {
          const list = items.filter((i) => i.categoryId === c.id);
          if (!list.length) return null;
          return (
            <section key={c.id} ref={(el) => { sections.current[c.id] = el; }} className="scroll-mt-40 pt-8">
              <h2 className="rt-serif mb-4 text-[26px]">{c.name[lang]}</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {list.map((i) => (
                  <button key={i.id} disabled={!i.available} onClick={() => setOpen(i)} className={cn("rt-card group flex min-h-32 overflow-hidden text-left transition", i.available ? "hover:border-[var(--rt-faint)]" : "opacity-55")} aria-label={`${i.name[lang]} ${money(i.price)}`}>
                    <div className="flex min-w-0 flex-1 flex-col p-4">
                      <div className="text-[16.5px] font-semibold leading-snug">{i.name[lang]}</div>
                      <div className="mt-1 line-clamp-2 text-[13.5px] text-[var(--rt-muted)]">{i.desc[lang]}</div>
                      <div className="mt-auto flex items-center gap-2 pt-3">
                        <span className="tnum text-[15px] font-semibold">{money(i.price)}</span>
                        {!i.available ? <span className="rt-chip border-[var(--rt-accent)] text-[var(--rt-accent)]">{t("soldOut", lang)}</span> : i.tags.includes("signature") ? <span className="rt-chip border-[var(--rt-gold)] text-[var(--rt-gold)]">{t("signatureTag", lang)}</span> : i.tags.includes("chef") ? <span className="rt-chip border-[var(--rt-accent)] text-[var(--rt-accent)]">{t("chef", lang)}</span> : null}
                      </div>
                    </div>
                    <div className="relative w-32 shrink-0 overflow-hidden sm:w-36"><DishPhoto item={i} sizes="144px" className="transition duration-700 group-hover:scale-105" />
                      {i.available && <span className="absolute bottom-2 right-2 grid size-9 place-items-center rounded-full bg-[var(--rt-accent)] text-[var(--rt-accent-ink)] shadow-lg"><Icon name="plus" size={18} /></span>}
                    </div>
                  </button>
                ))}
              </div>
            </section>
          );
        })}
      </div>
      {open && <DishSheet item={open} lang={lang} onClose={() => setOpen(null)} onAdd={onAdd} />}
    </div>
  );
}

export function CartSheet({ lang, lines, setQty, onClose, footer }: { lang: Lang; lines: CartLine[]; setQty: (i: number, q: number) => void; onClose: () => void; footer: React.ReactNode }) {
  const { state } = useR();
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label={t("cart", lang)}>
      <div className="rt-fade absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="rt-sheet relative flex max-h-[90dvh] w-full max-w-lg flex-col rounded-t-[28px] bg-[var(--rt-bg)] sm:rounded-[28px]">
        <div className="flex items-center justify-between px-5 pb-2 pt-5"><h2 className="rt-serif text-[26px]">{t("cart", lang)}</h2><button onClick={onClose} className="grid size-10 place-items-center rounded-full border border-[var(--rt-line)]" aria-label={t("back", lang)}><Icon name="x" size={17} /></button></div>
        <ul className="flex-1 divide-y divide-[var(--rt-line)] overflow-y-auto px-5">
          {!lines.length && <li className="py-10 text-center text-[var(--rt-muted)]">{t("emptyCart", lang)}</li>}
          {lines.map((l, i) => {
            const item = state.items.find((x) => x.id === l.itemId);
            if (!item) return null;
            const mods = item.groups.flatMap((g) => g.options).filter((o) => l.modifierIds.includes(o.id));
            return (
              <li key={i} className="flex items-start gap-3 py-4">
                <div className="min-w-0 flex-1">
                  <div className="font-semibold">{item.name[lang]}{!item.available && <span className="rt-chip ml-2 border-[var(--rt-accent)] text-[var(--rt-accent)]">{t("soldOut", lang)}</span>}</div>
                  {mods.length > 0 && <div className="text-[13px] text-[var(--rt-muted)]">{mods.map((m) => m.name[lang]).join(", ")}</div>}
                  {l.note && <div className="text-[13px] italic text-[var(--rt-muted)]">“{l.note}”</div>}
                  <div className="tnum mt-1 text-[14px]">{money(cartLinePrice(item, l.modifierIds) * l.qty)}</div>
                </div>
                <div className="flex items-center rounded-full border border-[var(--rt-line)]">
                  <button className="grid size-10 place-items-center" onClick={() => setQty(i, l.qty - 1)} aria-label="−">−</button>
                  <span className="tnum w-5 text-center text-[14px] font-semibold">{l.qty}</span>
                  <button className="grid size-10 place-items-center" onClick={() => setQty(i, l.qty + 1)} aria-label="+">+</button>
                </div>
              </li>
            );
          })}
        </ul>
        <div className="border-t border-[var(--rt-line)] p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">{footer}</div>
      </div>
    </div>
  );
}

export function CartBar({ lang, count, total, onClick }: { lang: Lang; count: number; total: number; onClick: () => void }) {
  if (!count) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <button onClick={onClick} className="rt-btn rt-btn-accent rt-fade mx-auto flex h-14 w-full max-w-lg justify-between px-5 shadow-2xl">
        <span className="flex items-center gap-2"><span className="tnum grid size-7 place-items-center rounded-full bg-black/15 text-[13px]">{count}</span>{t("viewOrder", lang)}</span>
        <span className="tnum">{money(total)}</span>
      </button>
    </div>
  );
}
