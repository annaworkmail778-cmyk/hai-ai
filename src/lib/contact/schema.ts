import { defaultLocale, isLocale, type Locale } from "@/i18n/config";

/**
 * Contact form schema, shared by the browser (instant feedback) and the API
 * route (authoritative check). Error codes map to `contact.errors.*` strings.
 */

/** Business areas a visitor can tick. Ids match the homepage diagnostic categories. */
export const CONTACT_AREAS = ["sales", "operations", "support", "marketing", "booking", "data"] as const;
export type ContactArea = (typeof CONTACT_AREAS)[number];

export const CONTACT_FIELDS = ["name", "company", "contact", "business", "improve", "process"] as const;
export type ContactField = (typeof CONTACT_FIELDS)[number];

type Rule = { required: boolean; min?: number; max: number };

export const CONTACT_RULES: Record<ContactField, Rule> = {
  name: { required: true, max: 120 },
  company: { required: false, max: 160 },
  contact: { required: true, max: 160 },
  business: { required: true, min: 8, max: 1500 },
  improve: { required: true, min: 8, max: 2000 },
  process: { required: false, min: 8, max: 2000 },
};

export type FieldErrorCode = "required" | "contact" | "tooShort" | "tooLong";
export type FieldError = { code: FieldErrorCode; max?: number };
export type ContactErrors = Partial<Record<ContactField, FieldError>>;

export type ContactValues = Record<ContactField, string>;
export type ContactPayload = ContactValues & { areas: ContactArea[]; locale: Locale };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isEmail(value: string) {
  return value.length <= 254 && EMAIL.test(value);
}

/** International or local number: 7–15 digits, optional leading +, common separators. */
export function isPhone(value: string) {
  return /^\+?\d{7,15}$/.test(value.replace(/[\s\-().]/g, ""));
}

export function isContactArea(value: unknown): value is ContactArea {
  return typeof value === "string" && (CONTACT_AREAS as readonly string[]).includes(value);
}

export function emptyValues(): ContactValues {
  return { name: "", company: "", contact: "", business: "", improve: "", process: "" };
}

function clean(value: unknown) {
  return typeof value === "string" ? value.replace(/\r\n?/g, "\n").trim() : "";
}

export function validateField(field: ContactField, raw: string): FieldError | null {
  const value = raw.trim();
  const rule = CONTACT_RULES[field];
  if (!value) return rule.required ? { code: "required" } : null;
  if (value.length > rule.max) return { code: "tooLong", max: rule.max };
  if (field === "contact") return isEmail(value) || isPhone(value) ? null : { code: "contact" };
  if (rule.min && value.length < rule.min) return { code: "tooShort" };
  return null;
}

export function validateValues(values: ContactValues): ContactErrors {
  const errors: ContactErrors = {};
  for (const field of CONTACT_FIELDS) {
    const error = validateField(field, values[field]);
    if (error) errors[field] = error;
  }
  return errors;
}

/** Validates untrusted input (the API request body). */
export function parseContact(
  input: unknown,
): { ok: true; data: ContactPayload } | { ok: false; errors: ContactErrors } {
  const source = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const values = emptyValues();
  for (const field of CONTACT_FIELDS) values[field] = clean(source[field]);
  const errors = validateValues(values);
  if (Object.keys(errors).length > 0) return { ok: false, errors };
  const areas = Array.isArray(source.areas) ? [...new Set(source.areas.filter(isContactArea))] : [];
  const locale = typeof source.locale === "string" && isLocale(source.locale) ? source.locale : defaultLocale;
  return { ok: true, data: { ...values, areas, locale } };
}
