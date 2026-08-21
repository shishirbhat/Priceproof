/**
 * Display formatting shared by every dashboard surface.
 *
 * These were duplicated across four pages, which is how two of them ended up
 * rendering rupee amounts differently. One definition, so a figure looks the
 * same everywhere it appears.
 */

/** Indian-format rupees, no decimals — listing prices are always whole. */
export function formatCurrency(v: string | number) {
  return `₹${Number(v).toLocaleString("en-IN")}`;
}

/** Compact rupees for axis labels and dense tiles (₹4.2L / ₹1.1Cr). */
export function formatCurrencyCompact(v: string | number) {
  const n = Number(v);
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(n >= 1e8 ? 0 : 1)}Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(n >= 1e6 ? 0 : 1)}L`;
  if (n >= 1e3) return `₹${(n / 1e3).toFixed(0)}k`;
  return `₹${n}`;
}

/** Relative time, coarsening as it gets older — precision nobody reads is noise. */
export function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 48) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

/** The API returns intervals as seconds-in-a-string; days is what we show. */
export function secondsToDays(seconds: string | number) {
  return Math.round(Number(seconds) / 86400);
}
