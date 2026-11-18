/** 1 -> "01" */
export const pad = (n: number) => String(n).padStart(2, '0');

/** Replaces {year} with the current year. */
export const withYear = (text: string) => text.replace('{year}', String(new Date().getFullYear()));

/** "2026-11-03" -> "3 Nov 2026" */
export function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
/** 10–15 digits; digits, spaces, dashes, dots and brackets allowed, plus one + at the start (or after an opening bracket, e.g. "(+91)"). */
export function isPhone(v: string): boolean {
  const s = v.trim();
  if (!/^\(?\+?[\d\s\-().]+$/.test(s)) return false;
  const digits = s.replace(/\D/g, '').length;
  return digits >= 10 && digits <= 15;
}
