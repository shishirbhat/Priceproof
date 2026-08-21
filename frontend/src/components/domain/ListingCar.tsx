import { useMemo, useState } from "react";
import { Turntable } from "@/components/racing/Turntable";
import type { SilhouetteName } from "@/components/racing/carRenderer";

/**
 * A rotating stand-in for the listed car.
 *
 * The seller's own photograph is the real car and always wins — it is
 * presented against a common studio backdrop so a page of wildly different
 * crops and lighting still reads as one set.
 *
 * Only when a listing carries no usable photo does this fall back to
 * generated geometry, which is labelled as a render so it can never be
 * mistaken for the actual vehicle. Paint is hashed from make and model so
 * the same car always comes back the same colour.
 */

/** Body tones, chosen to stay legible against the studio backdrop. */
const BODIES = [
  "#8b9099", "#6f757e", "#9aa0a8", "#5f6b7e",
  "#7c7f86", "#66707d", "#8d8579", "#74797f",
];

/**
 * Body-type keywords, checked against the listing text.
 *
 * Paint is hashed because a colour is arbitrary and harmless. Body type is
 * not — rendering a hatchback as an SUV would be asserting something false
 * about the car — so it is only ever inferred from what the listing
 * actually says, and falls back to the most common shape when it says
 * nothing. Portals that publish a body-type field should be passed through
 * `bodyType` instead of relying on this.
 */
const BODY_KEYWORDS: Array<[RegExp, SilhouetteName]> = [
  [/\b(suv|crossover|xuv|creta|seltos|nexon|venue|brezza|scorpio|fortuner|thar|harrier|safari)\b/i, "suv"],
  [/\b(hatch|hatchback|swift|i10|i20|alto|wagon\s?r|celerio|tiago|baleno|polo|santro|kwid)\b/i, "hatchback"],
  [/\b(sedan|saloon|dzire|city|verna|ciaz|amaze|aura|virtus|slavia|octavia)\b/i, "sedan"],
];

function inferSilhouette(text: string): SilhouetteName {
  for (const [pattern, name] of BODY_KEYWORDS) {
    if (pattern.test(text)) return name;
  }
  // Sedan is the safest neutral shape when the listing does not say.
  return "sedan";
}

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

type Props = {
  make: string | null;
  model: string | null;
  title: string;
  /** The seller's photograph, as published by the portal. */
  imageUrl?: string | null;
  /** Pass through when the portal publishes a real body-type field. */
  bodyType?: SilhouetteName;
  /**
   * Called when the seller's photograph turns out to be unusable, so the
   * page can retract any claim it made about showing a real photo.
   */
  onPhotoUnavailable?: () => void;
  className?: string;
};

export function ListingCar({
  make,
  model,
  title,
  imageUrl,
  bodyType,
  onPhotoUnavailable,
  className = "",
}: Props) {
  // A photo URL that fails to load leaves us showing generated geometry, so
  // it has to be labelled as a render just like a listing with no photo.
  const [photoFailed, setPhotoFailed] = useState(false);
  // Key off make+model so every trim of the same car shares a colour, and
  // fall back to the title when the portal did not break the fields out.
  const seed = `${make ?? ""}|${model ?? ""}` .trim() === "|" ? title : `${make}|${model}`;
  const paint = useMemo(() => {
    const h = hash(seed);
    return { base: BODIES[h % BODIES.length], accent: "#e6142d" };
  }, [seed]);

  const silhouette =
    bodyType ?? inferSilhouette([make, model, title].filter(Boolean).join(" "));

  const label = [make, model].filter(Boolean).join(" ") || title;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-[#0b0b0d] ${className}`}
      style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.07)" }}
    >
      {/* A slower idle than the showroom hero — this sits next to data the
          reader is trying to actually read. */}
      <Turntable
        paint={paint}
        label={label}
        idleSpeed={0.16}
        silhouette={silhouette}
        poster={imageUrl ?? undefined}
        posterAlt={`${label} — photograph published by the seller`}
        onPosterError={() => {
          setPhotoFailed(true);
          onPhotoUnavailable?.();
        }}
      />
      {(!imageUrl || photoFailed) && (
        <span className="pointer-events-none absolute bottom-3 left-4 text-[9.5px] tracking-[0.18em] text-white/35 uppercase">
          Render · no seller photo
        </span>
      )}
    </div>
  );
}
