import { useState } from "react";
import { Car } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Listing photography.
 *
 * Two failure modes this has to survive, because both are normal rather than
 * exceptional: a listing with no image at all (portals omit it often enough),
 * and a URL that resolves today and 404s tomorrow — seeded rows point at a
 * placeholder service, live rows point at portal CDNs that expire images once
 * a car sells. Both collapse to the same neutral plate instead of a broken
 * image glyph, so a grid of cards never goes ragged mid-demo.
 */
export function ListingImage({
  src,
  alt,
  className,
}: {
  src: string | null;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const showFallback = !src || failed;

  return (
    <div
      className={cn(
        "relative aspect-[4/3] shrink-0 overflow-hidden rounded-lg border border-white/[0.08] bg-muted",
        className,
      )}
    >
      {showFallback ? (
        <div className="flex h-full w-full items-center justify-center">
          <Car className="h-6 w-6 text-muted-foreground/40" strokeWidth={1.25} />
        </div>
      ) : (
        <>
          <img
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            onError={() => setFailed(true)}
            className="h-full w-full object-cover"
          />
          {/* Photography is the only saturated color on these pages, so it gets
              damped slightly — it should frame the numbers, not outshout them. */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
        </>
      )}
    </div>
  );
}
