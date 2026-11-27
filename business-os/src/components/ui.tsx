"use client";
import { useEffect, useRef, useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { Icon, type IconName } from "./icons";

export const cn = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

type BtnVariant = "primary" | "secondary" | "ghost" | "danger" | "signal" | "ok";
const BTN: Record<BtnVariant, string> = {
  primary: "bg-ink text-white hover:bg-ink-2 shadow-sm",
  signal: "bg-signal text-white hover:brightness-95 shadow-sm",
  ok: "bg-ok text-white hover:brightness-95 shadow-sm",
  secondary: "bg-surface text-ink border border-line-2 hover:bg-paper",
  ghost: "text-ink hover:bg-black/5",
  danger: "bg-surface text-bad border border-line-2 hover:bg-bad-soft",
};

export function Button({ variant = "secondary", size = "md", icon, iconRight, className, children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; size?: "sm" | "md" | "lg"; icon?: IconName; iconRight?: IconName }) {
  return (
    <button
      {...rest}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-[background,filter,transform] active:scale-[0.98] disabled:opacity-45 disabled:active:scale-100 whitespace-nowrap",
        size === "sm" ? "h-8 px-2.5 text-[13px]" : size === "lg" ? "h-12 px-5 text-[15px]" : "h-9 px-3.5 text-sm",
        BTN[variant],
        className,
      )}
    >
      {icon && <Icon name={icon} size={size === "sm" ? 15 : 17} />}
      {children}
      {iconRight && <Icon name={iconRight} size={size === "sm" ? 15 : 17} />}
    </button>
  );
}

export type Tone = "neutral" | "ok" | "warn" | "bad" | "info" | "violet" | "signal" | "dark";
const TONE: Record<Tone, string> = {
  neutral: "bg-black/[0.05] text-ink-2",
  ok: "bg-ok-soft text-ok",
  warn: "bg-warn-soft text-warn",
  bad: "bg-bad-soft text-bad",
  info: "bg-info-soft text-info",
  violet: "bg-violet-soft text-violet",
  signal: "bg-signal-soft text-signal",
  dark: "bg-ink text-white",
};
export function Badge({ tone = "neutral", children, className, dot }: { tone?: Tone; children: ReactNode; className?: string; dot?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[12px] font-medium leading-4 whitespace-nowrap", TONE[tone], className)}>
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

export function Card({ children, className, pad = true }: { children: ReactNode; className?: string; pad?: boolean }) {
  return <section className={cn("rounded-[var(--radius-card)] border border-line bg-surface shadow-[var(--shadow-card)]", pad && "p-4 sm:p-5", className)}>{children}</section>;
}

export function CardHead({ title, sub, right, icon }: { title: ReactNode; sub?: ReactNode; right?: ReactNode; icon?: IconName }) {
  return (
    <div className="mb-3.5 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="flex items-center gap-2 text-[15px] font-semibold tracking-tight">{icon && <Icon name={icon} size={17} className="text-muted" />}{title}</h2>
        {sub && <p className="mt-0.5 text-[13px] text-muted">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

export function Kpi({ label, value, sub, icon, tone, onClick }: { label: string; value: ReactNode; sub?: ReactNode; icon?: IconName; tone?: Tone; onClick?: () => void }) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp onClick={onClick} className={cn("group flex min-w-0 flex-col rounded-[var(--radius-card)] border border-line bg-surface p-4 text-left shadow-[var(--shadow-card)]", onClick && "transition hover:border-line-2 hover:shadow-md")}>
      <div className="flex items-center justify-between gap-2 text-[12.5px] font-medium text-muted">
        <span className="line-clamp-2 leading-snug">{label}</span>
        {icon && <span className={cn("grid size-7 place-items-center rounded-lg", tone ? TONE[tone] : "bg-black/[0.04] text-muted")}><Icon name={icon} size={15} /></span>}
      </div>
      <div className="tnum mt-2 text-[26px] font-semibold leading-none tracking-tight">{value}</div>
      {sub && <div className="mt-2 text-[12.5px] text-muted">{sub}</div>}
    </Comp>
  );
}

export function Field({ label, hint, children, className }: { label: string; hint?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1 block text-[12.5px] font-medium text-muted">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[12px] text-faint">{hint}</span>}
    </label>
  );
}

const inputCls = "h-10 w-full rounded-lg border border-line-2 bg-surface px-3 text-sm outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10";
export const Input = (p: InputHTMLAttributes<HTMLInputElement>) => <input {...p} className={cn(inputCls, p.className)} />;
export const Select = (p: SelectHTMLAttributes<HTMLSelectElement>) => <select {...p} className={cn(inputCls, "pr-8", p.className)} />;
export const Textarea = (p: TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea {...p} className={cn(inputCls, "h-auto min-h-20 py-2", p.className)} />;

export function Toggle({ on, onChange, label, disabled }: { on: boolean; onChange: (v: boolean) => void; label?: string; disabled?: boolean }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} disabled={disabled} onClick={() => onChange(!on)} className={cn("relative h-6 w-11 shrink-0 rounded-full transition", on ? "bg-ok" : "bg-line-2", disabled && "opacity-50")}>
      <span className={cn("absolute top-0.5 size-5 rounded-full bg-white shadow transition", on ? "left-[22px]" : "left-0.5")} />
    </button>
  );
}

export function Avatar({ initials, tone = "neutral", size = 28 }: { initials: string; tone?: Tone; size?: number }) {
  return <span className={cn("inline-grid shrink-0 place-items-center rounded-full text-[11px] font-semibold", TONE[tone])} style={{ width: size, height: size }}>{initials}</span>;
}

export function Drawer({ open, onClose, title, sub, children, footer, wide }: { open: boolean; onClose: () => void; title: ReactNode; sub?: ReactNode; children: ReactNode; footer?: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" onClick={onClose} />
      <aside className={cn("rise-in absolute inset-y-0 right-0 flex w-full flex-col bg-surface shadow-[var(--shadow-pop)]", wide ? "max-w-2xl" : "max-w-lg")}>
        <header className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div className="min-w-0">
            <h3 className="text-base font-semibold tracking-tight">{title}</h3>
            {sub && <div className="mt-0.5 text-[13px] text-muted">{sub}</div>}
          </div>
          <button onClick={onClose} className="grid size-8 place-items-center rounded-lg text-muted hover:bg-black/5" aria-label="Փակել"><Icon name="x" /></button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <footer className="border-t border-line bg-paper/60 px-5 py-3">{footer}</footer>}
      </aside>
    </div>
  );
}

export function Modal({ open, onClose, title, children, footer, size = "md" }: { open: boolean; onClose: () => void; title: ReactNode; children: ReactNode; footer?: ReactNode; size?: "md" | "lg" }) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-3">
      <div className="absolute inset-0 bg-black/35" onClick={onClose} />
      <div className={cn("rise-in relative flex max-h-[92vh] w-full flex-col rounded-2xl bg-surface shadow-[var(--shadow-pop)]", size === "lg" ? "max-w-2xl" : "max-w-md")}>
        <header className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <h3 className="text-base font-semibold">{title}</h3>
          <button onClick={onClose} className="grid size-8 place-items-center rounded-lg text-muted hover:bg-black/5" aria-label="Փակել"><Icon name="x" /></button>
        </header>
        <div className="overflow-y-auto px-5 py-4">{children}</div>
        {footer && <footer className="flex justify-end gap-2 border-t border-line px-5 py-3">{footer}</footer>}
      </div>
    </div>
  );
}

export function Tabs<T extends string>({ value, onChange, items, className }: { value: T; onChange: (v: T) => void; items: { id: T; label: ReactNode; count?: number }[]; className?: string }) {
  return (
    <div className={cn("scrollbar-none flex gap-1 overflow-x-auto rounded-xl border border-line bg-surface p-1", className)}>
      {items.map((it) => (
        <button key={it.id} onClick={() => onChange(it.id)} className={cn("flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-3 text-[13px] font-medium transition", value === it.id ? "bg-ink text-white" : "text-muted hover:bg-black/5 hover:text-ink")}>
          {it.label}
          {it.count !== undefined && <span className={cn("tnum rounded px-1 text-[11px]", value === it.id ? "bg-white/20" : "bg-black/[0.06]")}>{it.count}</span>}
        </button>
      ))}
    </div>
  );
}

export function Empty({ icon = "check", title, text }: { icon?: IconName; title: string; text?: string }) {
  return (
    <div className="grid place-items-center gap-1.5 rounded-xl border border-dashed border-line-2 px-4 py-8 text-center">
      <Icon name={icon} size={22} className="text-faint" />
      <div className="text-sm font-medium">{title}</div>
      {text && <div className="max-w-xs text-[13px] text-muted">{text}</div>}
    </div>
  );
}

/** Label for any message the demo prepares but never sends. */
export function SimBadge({ scheduled }: { scheduled?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-dashed border-violet/40 bg-violet-soft px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-violet">
      <Icon name="info" size={12} />
      {scheduled ? "Պլանավորված · սիմուլյացիա" : "Սիմուլյացիա · չի ուղարկվել"}
    </span>
  );
}

export function DemoDataBadge() {
  return <Badge tone="warn" className="uppercase tracking-wide">Ցուցադրական տվյալներ</Badge>;
}

export function useToast() {
  const [msg, setMsg] = useState<string | null>(null);
  const t = useRef<ReturnType<typeof setTimeout>>(undefined);
  const show = (m: string) => { setMsg(m); clearTimeout(t.current); t.current = setTimeout(() => setMsg(null), 3200); };
  const node = msg ? (
    <div className="rise-in fixed bottom-5 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-xl bg-ink px-4 py-3 text-sm text-white shadow-[var(--shadow-pop)]">
      <Icon name="check" size={16} className="text-ok" /> {msg}
    </div>
  ) : null;
  return { show, node };
}

export function Segmented<T extends string>({ value, onChange, items }: { value: T; onChange: (v: T) => void; items: { id: T; label: string }[] }) {
  return (
    <div className="inline-flex rounded-lg border border-line-2 bg-surface p-0.5">
      {items.map((it) => (
        <button key={it.id} onClick={() => onChange(it.id)} className={cn("h-7 rounded-md px-2.5 text-[12.5px] font-medium", value === it.id ? "bg-ink text-white" : "text-muted hover:text-ink")}>{it.label}</button>
      ))}
    </div>
  );
}
