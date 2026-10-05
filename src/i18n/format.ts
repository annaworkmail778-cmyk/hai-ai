/** Replace {placeholders} in a translated string. */
export function interpolate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

/** Two-digit index used throughout the editorial layouts: 1 -> "01". */
export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}
