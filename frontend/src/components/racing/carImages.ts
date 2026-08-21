/**
 * Car imagery, resolved from the filesystem at build time.
 *
 * Everything under `src/assets/cars/<id>/` is discovered by Vite's glob
 * import, hashed, and emitted as a normal build asset. Adding photography
 * is therefore a matter of dropping files into the right folder — there is
 * no manifest to keep in sync, and folders that stay empty simply resolve
 * to nothing, which is what makes the generated fallback kick in.
 *
 * See `src/assets/cars/README.md` for the folder convention.
 */

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
