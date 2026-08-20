/**
 * The vehicle segments the platform scores against.
 *
 * Market value is only ever computed within a segment — a hatchback's
 * median tells you nothing about an SUV's asking price — so the segments
 * are the natural thing for the front door to lead with.
 */
import type { SilhouetteName } from "@/components/racing/carRenderer";

export type Segment = {
  id: string;
  name: string;
  headline: string;
  note: string;
  paint: { base: string; accent: string };
  /** Body shape the hero renders for this segment. */
  silhouette: SilhouetteName;
};

export const SEGMENTS: Segment[] = [
  {
    id: "hatchback",
    name: "Hatchback",
    headline: "The thickest part of the market.",
    note: "Enough comparable listings to score almost any asking price with confidence.",
    paint: { base: "#8b9099", accent: "#e6142d" },
    silhouette: "hatchback",
  },
  {
    id: "sedan",
    name: "Sedan",
    headline: "Where trim level decides the price.",
    note: "Scored on make and model, widened to model-year when a line runs thin.",
    paint: { base: "#6f757e", accent: "#e6142d" },
    silhouette: "sedan",
  },
  {
    id: "suv",
    name: "SUV",
    headline: "The fastest-moving segment.",
    note: "Shorter days-on-market, and the markdowns arrive later in the listing's life.",
    paint: { base: "#5f6b7e", accent: "#e6142d" },
    silhouette: "suv",
  },
  {
    id: "luxury",
    name: "Luxury",
    headline: "Thin lines, careful verdicts.",
    note: "Often below five comparables — where the honest answer is no verdict at all.",
    paint: { base: "#9aa0a8", accent: "#e6142d" },
    silhouette: "sedan",
  },
];

/** The four capabilities, in the order the product actually runs them. */
export const CAPABILITIES = [
  {
    n: "01",
    title: "Market Value",
    body:
      "Every active listing scored against the median of comparable listings — same make and model, widened to make and model-year when a line is too thin. A verdict only ever comes with enough comparables behind it.",
    to: "/market-value",
  },
  {
    n: "02",
    title: "Cross-Portal Matching",
    body:
      "The same car, cross-posted by one seller to two portals at two prices — matched on make, model, year, registration prefix and city, because no portal publishes a full VIN on its results grid.",
    to: "/cross-portal",
  },
  {
    n: "03",
    title: "Days on Market",
    body:
      "A listing disappearing between two collection runs is the only sold signal a portal gives. Track that, plus every markdown before it goes, and you get sell-through the portals themselves never show.",
    to: "/market-activity",
  },
  {
    n: "04",
    title: "Collection Health",
    body:
      "Field-level coverage over time, so a portal that changes shape under the collector surfaces as a drift alert and then a recovery — rather than as silence.",
    to: "/scraper-health",
  },
];
