import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Rupee display formatter. Prices arrive as Postgres `numeric` (and medians
 * are computed, so they carry a fractional tail) — a car is never quoted in
 * paise, so round to whole rupees rather than rendering "₹6,22,968.61".
 */
export function formatCurrency(v: string | number) {
  return `₹${Number(v).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
}
