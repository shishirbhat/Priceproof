// In dev, "/api" is proxied to localhost:3001 by vite.config.ts. In a static
// production deploy (e.g. Vercel) there's no dev proxy, so the backend's
// real URL must be supplied via VITE_API_URL — falls back to the relative
// path so nothing changes for local dev if it's unset.
const BASE = `${import.meta.env.VITE_API_URL ?? ""}/api`;

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) {
    throw new Error(`${path} failed: ${res.status}`);
  }
  return res.json();
}

export interface Kpis {
  listings_tracked: number;
  portals: number;
  price_changes_24h: number;
  newly_delisted_24h: number;
  cross_portal_matches: number;
  overpriced_count: number;
}

export type MarketVerdict = "GOOD_DEAL" | "FAIR" | "OVERPRICED" | "INSUFFICIENT_COMPARABLES";

export interface MarketValueRow {
  listing_id: number;
  portal_id: number;
  portal_name: string;
  listing_url: string;
  title: string;
  make: string | null;
  model: string | null;
  year: number | null;
  city: string | null;
  odometer_km: number | null;
  main_image_url: string | null;
  is_seeded: boolean;
  current_price: string;
  segment_median: string | null;
  segment_size: number;
  segment_level: "make_model" | "make_year_band" | "insufficient";
  pct_vs_median: number | null;
  verdict: MarketVerdict;
}

export interface ListingRow {
  listing_id: number;
  title: string;
  make: string | null;
  model: string | null;
  year: number | null;
  city: string | null;
  registration_prefix: string | null;
  seller_type: string | null;
  main_image_url: string | null;
  listing_url: string;
  needs_review: boolean;
  delisted_at: string | null;
  first_seen_at: string;
  portal_id: number;
  portal_name: string;
  current_price: string;
  original_price: string | null;
  odometer_km: number | null;
  scraped_at: string;
  is_seeded: boolean;
}

export interface ListingSnapshot {
  id: number;
  listing_id: number;
  current_price: string;
  original_price: string | null;
  currency: string;
  odometer_km: number | null;
  scraped_at: string;
  is_seeded: boolean;
}

export interface ListingDetail {
  listing: {
    id: number;
    portal_id: number;
    portal_name: string;
    portal_base_url: string;
    external_listing_id: string;
    listing_url: string;
    title: string;
    make: string | null;
    model: string | null;
    year: number | null;
    odometer_km: number | null;
    fuel_type: string | null;
    transmission: string | null;
    registration_prefix: string | null;
    city: string | null;
    seller_type: string | null;
    main_image_url: string | null;
    needs_review: boolean;
    first_seen_at: string;
    last_seen_at: string;
    delisted_at: string | null;
  };
  snapshots: ListingSnapshot[];
  duplicate_of: { id: number; title: string; listing_url: string; portal_name: string } | null;
  duplicates: Array<{ id: number; title: string; listing_url: string; portal_name: string }>;
}

export interface DelistingEvent {
  listing_id: number;
  title: string;
  make: string | null;
  model: string | null;
  year: number | null;
  city: string | null;
  portal_name: string;
  is_seeded: boolean;
  first_seen_at: string;
  last_seen_at: string;
  delisted_at: string;
  days_on_market_seconds: string;
  last_known_price: string | null;
}

export interface DaysOnMarketRow {
  make: string;
  sold_count: string;
  avg_days_on_market: string;
}

export interface ActiveLongestRow {
  listing_id: number;
  title: string;
  make: string | null;
  model: string | null;
  year: number | null;
  city: string | null;
  portal_name: string;
  is_seeded: boolean;
  first_seen_at: string;
  days_active_seconds: string;
}

export interface CrossPortalMatchRow {
  listing_id: number;
  listing_title: string;
  listing_url: string;
  is_seeded: boolean;
  portal_name: string;
  current_price: string;
  matched_listing_id: number;
  matched_title: string;
  matched_listing_url: string;
  matched_portal_name: string;
  matched_price: string;
  match_confidence: string | null;
  needs_review: boolean;
  pct_price_gap: string;
}

export interface CollectionRow {
  id: number;
  portal_id: number;
  portal_name: string;
  snapshot_id_external: string;
  triggered_at: string;
  completed_at: string | null;
  status: string;
  record_count: number | null;
  page_loads_used: number | null;
  duration_seconds: number | null;
}

export interface FieldCoverageRow {
  id: number;
  collection_id: number;
  field_name: string;
  present_count: number;
  total_count: number;
  triggered_at: string;
  portal_id: number;
  portal_name: string;
}

export interface PortalRow {
  id: number;
  name: string;
  country: string | null;
  base_url: string;
  collector_id: string;
  is_active: boolean;
  tracked_listings: string;
  last_collection_at: string | null;
}

export interface AlertRow {
  id: number;
  listing_id: number;
  rule_type: string;
  threshold: string | null;
  channel: string;
  is_active: boolean;
  created_at: string;
  title: string;
  portal_name: string;
  fired_count: string;
  last_fired_at: string | null;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${path} failed: ${res.status}`);
  return res.json();
}

export const api = {
  kpis: () => get<Kpis>("/kpis"),
  portals: () => get<PortalRow[]>("/catalog/portals"),
  alerts: () => get<AlertRow[]>("/alerts"),
  createAlert: (body: { listing_id: number; rule_type: string; threshold?: number }) =>
    post<AlertRow>("/alerts", body),
  deleteAlert: (id: number) => fetch(`${BASE}/alerts/${id}`, { method: "DELETE" }),
  triggerCollection: (portalId: number) =>
    fetch(`${BASE}/catalog/portals/${portalId}/collect`, { method: "POST" }).then((r) => {
      if (!r.ok) throw new Error(`trigger failed: ${r.status}`);
      return r.json();
    }),
  marketValue: () => get<MarketValueRow[]>("/market-value"),
  marketValueHistory: (listingId: number) => get<ListingSnapshot[]>(`/market-value/${listingId}/history`),
  listings: () => get<ListingRow[]>("/listings"),
  listing: (id: number) => get<ListingDetail>(`/listings/${id}`),
  delistingEvents: () => get<DelistingEvent[]>("/market-activity/events"),
  daysOnMarket: () => get<DaysOnMarketRow[]>("/market-activity/days-on-market"),
  activeLongest: () => get<ActiveLongestRow[]>("/market-activity/active-longest"),
  crossPortalMatches: () => get<CrossPortalMatchRow[]>("/cross-portal"),
  collections: () => get<CollectionRow[]>("/scraper-health/collections"),
  fieldCoverage: () => get<FieldCoverageRow[]>("/scraper-health/field-coverage"),
};
