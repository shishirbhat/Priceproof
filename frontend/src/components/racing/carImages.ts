/**
 * Car imagery, resolved from the filesystem at build time.
 *
 * Two sources, merged:
 *
 * 1. Explicit imports of the segment hero photos below. These are bundled
 *    unconditionally, so the welcome hero always has real photography even if
 *    the glob scan below resolves nothing (a stale dev server that never
 *    re-scanned after the files were added, an environment where the glob
 *    misses, etc.). This is the guarantee.
 * 2. Vite's glob import of everything else under `src/assets/cars/<id>/`, so
 *    dropping additional per-car or per-segment folders still Just Works with
 *    no manifest to maintain. See `src/assets/cars/README.md`.
 *
 * Explicit entries win, so a segment listed here is never doubled up by the
 * glob also finding the same file.
 */

import hatchbackHero from "@/assets/cars/hatchback/maruti-swift.jpg";
import sedanHero from "@/assets/cars/sedan/honda-city.jpg";
import suvHero from "@/assets/cars/suv/hyundai-creta.jpg";
import luxuryHero from "@/assets/cars/luxury/mercedes-e-class.jpg";

/** Guaranteed segment photography, bundled by explicit import. */
const EXPLICIT: Record<string, string[]> = {
  hatchback: [hatchbackHero],
  sedan: [sedanHero],
  suv: [suvHero],
  luxury: [luxuryHero],
};

const MODULES = import.meta.glob<string>(
  "/src/assets/cars/*/*.{jpg,jpeg,png,webp,avif}",
  { eager: true, import: "default" },
);

/** id -> ordered frame URLs. */
const BY_ID: Record<string, string[]> = {};

for (const path of Object.keys(MODULES).sort()) {
  // "/src/assets/cars/<id>/<file>" — the id is the second-to-last segment.
  const parts = path.split("/");
  const id = parts[parts.length - 2];
  if (!id) continue;
  (BY_ID[id] ??= []).push(MODULES[path]);
}

// Explicit segment heroes take precedence, so the hero is guaranteed real
// photography regardless of what the glob did (or didn't) resolve.
Object.assign(BY_ID, EXPLICIT);

/**
 * Frames for a car or segment id.
 *
 * Returns an empty array when nothing has been supplied, so callers can
 * treat "no photography" as the ordinary case rather than an error.
 */
export function framesFor(id: string): string[] {
  return BY_ID[id] ?? [];
}

/** True when at least one image exists for this id. */
export function hasImagery(id: string): boolean {
  return (BY_ID[id]?.length ?? 0) > 0;
}
