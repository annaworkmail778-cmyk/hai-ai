"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { interpolate, pad2 } from "@/i18n/format";
import { cn } from "@/lib/cn";
import { Arrow } from "@/components/ui/Arrow";
import { scrollToTarget } from "@/components/motion/scroll-store";
import {
  CONTACT_FIELDS,
  CONTACT_RULES,
  emptyValues,
  isContactArea,
  validateField,
  validateValues,
  type ContactArea,
  type ContactErrors,
  type ContactField,
  type ContactValues,
  type FieldError,
} from "@/lib/contact/schema";

type Labels = Dictionary["contact"];

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent"; delivered: boolean }
  | { kind: "failed"; reason: "generic" | "notConfigured" | "rateLimited" };

type ApiResponse = {
  ok: boolean;
  delivered?: boolean;
  error?: string;
  fields?: ContactErrors;
};

const MULTILINE = new Set<ContactField>(["business", "improve", "process"]);

const noop = () => () => {};
/** False during SSR and hydration, true once React runs in the browser. */
const useHydrated = () => useSyncExternalStore(noop, () => true, () => false);

function withError(errors: ContactErrors, field: ContactField, error: FieldError | null): ContactErrors {
  const next = { ...errors };
  if (error) next[field] = error;
  else delete next[field];
  return next;
}

/**
 * Project inquiry form. Validates in the browser with the same rules the API
 * enforces, never reports delivery the server did not confirm, and keeps the
 * visitor's text when anything goes wrong.
 */
export function ContactForm({
  t,
  areas,
  email,
  locale,
}: {
  t: Labels;
  areas: Array<{ id: ContactArea; name: string }>;
  email: string;
  locale: Locale;
}) {
  const uid = useId();
  const hydrated = useHydrated();
  const [values, setValues] = useState<ContactValues>(emptyValues);
  const [selected, setSelected] = useState<ContactArea[]>([]);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [trap, setTrap] = useState("");
  const fields = useRef<Partial<Record<ContactField, HTMLInputElement | HTMLTextAreaElement | null>>>({});
  const resultRef = useRef<HTMLDivElement>(null);

  // Pre-select an area handed over by the homepage diagnostic (?area=sales).
  useEffect(() => {
    const preselect = () => {
      const area = new URLSearchParams(window.location.search).get("area");
      if (isContactArea(area)) setSelected((current) => (current.includes(area) ? current : [...current, area]));
    };
    preselect();
  }, []);

  // Bring the confirmation into view below the fixed navigation, then move focus to it.
  useEffect(() => {
    const result = resultRef.current;
    if (status.kind !== "sent" || !result) return;
    const nav = document.querySelector<HTMLElement>("[data-site-nav]");
    scrollToTarget(result, { offset: -((nav?.offsetHeight ?? 72) + 40) });
    result.focus({ preventScroll: true });
  }, [status.kind]);

  const message = (error: FieldError) => {
    switch (error.code) {
      case "required":
        return t.errors.required;
      case "contact":
        return t.errors.contact;
      case "tooShort":
        return t.errors.tooShort;
      case "tooLong":
        return interpolate(t.errors.tooLong, { max: error.max ?? "" });
    }
  };

  const onChange = (field: ContactField) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setValues((v) => ({ ...v, [field]: value }));
    // Errors already on screen update live, so they disappear as soon as the text is fixed.
    if (errors[field]) setErrors((current) => withError(current, field, validateField(field, value)));
  };

  const onBlur = (field: ContactField) => () => {
    const value = values[field];
    // Leaving an empty field is not an error until the visitor tries to send.
    if (!value.trim() && !submitted) return;
    setErrors((current) => withError(current, field, validateField(field, value)));
  };

  const toggleArea = (id: ContactArea) =>
    setSelected((current) => (current.includes(id) ? current.filter((a) => a !== id) : [...current, id]));

  const focusFirstInvalid = (found: ContactErrors) => {
    const first = CONTACT_FIELDS.find((f) => found[f]);
    if (first) fields.current[first]?.focus();
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status.kind === "sending") return;
    setSubmitted(true);
    const found = validateValues(values);
    setErrors(found);
    if (Object.keys(found).length) {
      focusFirstInvalid(found);
      return;
    }

    setStatus({ kind: "sending" });
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, areas: selected, locale, website: trap }),
      });
      const data = (await response.json().catch(() => null)) as ApiResponse | null;
      if (response.ok && data?.ok) {
        setStatus({ kind: "sent", delivered: data.delivered !== false });
        return;
      }
      if (response.status === 400 && data?.error === "validation" && data.fields) {
        setErrors(data.fields);
        setStatus({ kind: "idle" });
        focusFirstInvalid(data.fields);
        return;
      }
      const reason = response.status === 429 ? "rateLimited" : response.status === 503 ? "notConfigured" : "generic";
      setStatus({ kind: "failed", reason });
    } catch {
      setStatus({ kind: "failed", reason: "generic" });
    }
  };

  const reset = () => {
    setValues(emptyValues());
    setSelected([]);
    setErrors({});
    setSubmitted(false);
    setStatus({ kind: "idle" });
    requestAnimationFrame(() => fields.current.name?.focus());
  };

  const mail = <a href={`mailto:${email}`} className="link-underline">{email}</a>;
  const withEmail = (template: string): ReactNode => {
    const [before, after] = template.split("{email}");
    return after === undefined ? template : (
      <>
        {before}
        {mail}
        {after}
      </>
    );
  };

  if (status.kind === "sent") {
    return (
      <div ref={resultRef} tabIndex={-1} role="status" className="border-t border-rule pt-10 outline-none">
        <span aria-hidden="true" className="block size-3 bg-signal" />
        <h2 className="mt-8 text-display-m font-medium">{t.success.title}</h2>
        {status.delivered ? (
          <p className="mt-6 max-w-[44ch] text-lead text-fg-mute">{t.success.text}</p>
        ) : (
          <p className="mt-6 max-w-[52ch] border border-rule-strong p-5 text-body text-fg-mute">{t.success.dev}</p>
        )}
        <button type="button" onClick={reset} className="group mt-10 inline-flex items-center gap-3 font-medium">
          <span className="link-underline pb-1">{t.success.again}</span>
          <Arrow className="transition-transform duration-(--dur-ui) group-hover:translate-x-1" />
        </button>
      </div>
    );
  }

  const sending = status.kind === "sending";
  const errorCount = Object.keys(errors).length;
  const row = "grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-3 border-b border-rule py-6 md:grid-cols-[3rem_minmax(0,1fr)]";
  const control =
    "field-control block w-full rounded-none border-0 border-b border-rule-strong bg-transparent px-0 pt-3 pb-3 text-title text-fg transition-[border-color,box-shadow] duration-(--dur-ui) placeholder:text-fg-mute/70 focus:border-fg focus:shadow-[0_1px_0_0_var(--color-signal)] aria-invalid:border-signal";

  return (
    <form method="post" noValidate onSubmit={onSubmit} aria-busy={sending} className="relative">
      {/* Honeypot: hidden from people and assistive technology; bots fill it in. */}
      <div aria-hidden="true" className="pointer-events-none absolute -left-[10000px] h-px w-px overflow-hidden">
        <label htmlFor={`${uid}-website`}>Website</label>
        <input
          id={`${uid}-website`}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={trap}
          onChange={(e) => setTrap(e.target.value)}
        />
      </div>

      {submitted && errorCount > 0 && (
        <p role="alert" className="mb-8 flex items-center gap-3 border border-rule-strong px-4 py-3 text-small">
          <span aria-hidden="true" className="size-1.5 shrink-0 bg-signal" />
          {t.errors.summary}
        </p>
      )}

      <div className="border-t border-rule">
        {CONTACT_FIELDS.map((field, i) => {
          const id = `${uid}-${field}`;
          const errorId = `${id}-error`;
          const error = errors[field];
          const required = CONTACT_RULES[field].required;
          const props = {
            id,
            name: field,
            value: values[field],
            onChange: onChange(field),
            onBlur: onBlur(field),
            required,
            placeholder: t.placeholders[field],
            "aria-invalid": error ? true : undefined,
            "aria-describedby": error ? errorId : undefined,
          };
          return (
            <div key={field} className={row}>
              <span aria-hidden="true" className="label pt-1 text-fg-mute">
                {pad2(i + 1)}
              </span>
              <div className="min-w-0">
                <label htmlFor={id} className="flex items-baseline justify-between gap-4 text-small font-medium text-fg">
                  <span>{t.fields[field]}</span>
                  {!required && <span className="label shrink-0 text-fg-mute">{t.optional}</span>}
                </label>
                {MULTILINE.has(field) ? (
                  <textarea
                    {...props}
                    ref={(el) => {
                      fields.current[field] = el;
                    }}
                    rows={2}
                    className={cn(control, "field-sizing-content min-h-[4.75rem] resize-none")}
                  />
                ) : (
                  <input
                    {...props}
                    ref={(el) => {
                      fields.current[field] = el;
                    }}
                    type="text"
                    autoComplete={field === "name" ? "name" : field === "company" ? "organization" : "email"}
                    spellCheck={field === "contact" ? false : undefined}
                    autoCapitalize={field === "contact" ? "none" : undefined}
                    className={control}
                  />
                )}
                {error && (
                  <p id={errorId} className="mt-3 flex items-center gap-2 text-small text-fg">
                    <span aria-hidden="true" className="size-1.5 shrink-0 bg-signal" />
                    {message(error)}
                  </p>
                )}
              </div>
            </div>
          );
        })}

        <div role="group" aria-labelledby={`${uid}-areas`} className={row}>
          <span aria-hidden="true" className="label pt-1 text-fg-mute">
            {pad2(CONTACT_FIELDS.length + 1)}
          </span>
          <div>
            <p id={`${uid}-areas`} className="flex items-baseline justify-between gap-4 text-small font-medium text-fg">
              <span>{t.fields.areas}</span>
              <span className="label shrink-0 text-fg-mute">{t.optional}</span>
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {areas.map((area) => {
                const checked = selected.includes(area.id);
                return (
                  <li key={area.id}>
                    <label
                      className={cn(
                        "inline-flex cursor-pointer items-center gap-2.5 rounded-xs border px-3.5 py-2 text-small transition-colors duration-(--dur-micro) has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-signal",
                        checked ? "border-fg bg-fg text-bg" : "border-rule-strong text-fg-mute hover:border-fg hover:text-fg",
                      )}
                    >
                      <input
                        type="checkbox"
                        name="areas"
                        value={area.id}
                        checked={checked}
                        onChange={() => toggleArea(area.id)}
                        className="sr-only"
                      />
                      <span aria-hidden="true" className={cn("size-1.5 shrink-0", checked ? "bg-signal" : "border border-current")} />
                      {area.name}
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      {status.kind === "failed" && (
        <p role="alert" className="mt-8 flex gap-3 border border-rule-strong px-4 py-3 text-small">
          <span aria-hidden="true" className="mt-1.5 size-1.5 shrink-0 bg-signal" />
          <span>
            {status.reason === "notConfigured" && withEmail(t.errors.notConfigured)}
            {status.reason === "rateLimited" && t.errors.rateLimited}
            {status.reason === "generic" && (
              <>
                {t.errors.generic} {mail}
              </>
            )}
          </span>
        </p>
      )}

      <div className="mt-10 flex flex-col-reverse gap-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-[38ch] text-small text-fg-mute">{t.privacy}</p>
        <button
          type="submit"
          disabled={!hydrated || sending}
          className="group inline-flex h-14 shrink-0 items-center justify-between gap-8 rounded-xs bg-fg px-7 text-[0.95rem] font-medium text-bg transition-opacity duration-(--dur-ui) disabled:cursor-not-allowed disabled:opacity-60 md:h-16 md:px-8"
        >
          <span>{sending ? t.sending : t.submit}</span>
          <Arrow className="transition-transform duration-(--dur-ui) group-hover:translate-x-1" />
        </button>
      </div>
      <p role="status" className="sr-only">
        {sending ? t.sending : ""}
      </p>
    </form>
  );
}
