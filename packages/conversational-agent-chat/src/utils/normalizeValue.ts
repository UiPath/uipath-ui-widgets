const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Formats a Date as a `datetime-local`-compatible local timestamp
 * (`YYYY-MM-DDTHH:mm`). `toISOString()` would emit a UTC string with a
 * trailing `Z`, which native `<input type="datetime-local">` rejects and
 * renders blank.
 */
function toDateTimeLocal(date: Date): string {
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

/**
 * Normalizes values so the downstream form fields (which expect strings)
 * render them. Date instances — which callers may pass through `inputValue`
 * from earlier form state — become `datetime-local`-compatible strings.
 */
export function normalizeValue(value: unknown): unknown {
  if (value instanceof Date) return toDateTimeLocal(value);
  if (Array.isArray(value)) return value.map(normalizeValue);
  if (value && typeof value === "object") {
    const normalized: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      normalized[key] = normalizeValue(val);
    }
    return normalized;
  }
  return value;
}
