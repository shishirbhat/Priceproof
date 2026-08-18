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
  skus_tracked: number;
  stores: number;
  price_changes_24h: number;
  active_stockouts: number;
  open_map_violations: number;
  discount_integrity_failures: number;
}

export type IntegrityVerdict = "GENUINE" | "INFLATED" | "INSUFFICIENT_HISTORY";

export interface IntegrityRow {
  snapshot_id: number;
  store_product_id: number;
  product_id: number;
  title: string;
  image_url: string | null;
  store_name: string;
  product_url: string;
  scraped_at: string;
  current_price: string;
  list_price: string;
  true_30d_low: string | null;
  streak_start: string;
  history_start: string;
  is_seeded: boolean;
  verdict: IntegrityVerdict;
  inflation_pct: number | null;
}

export interface ProductListRow {
  product_id: number;
  title: string;
  brand: string | null;
  category: string | null;
  image_url: string | null;
  store_product_id: number;
  region_code: string;
  needs_review: boolean;
  store_id: number;
  store_name: string;
  current_price: string;
  list_price: string | null;
  in_stock: boolean;
  scarcity_text: string | null;
  scraped_at: string;
  is_seeded: boolean;
}

export interface Snapshot {
  id: number;
  store_product_id: number;
  current_price: string;
  list_price: string | null;
  currency: string;
  in_stock: boolean;
  scarcity_text: string | null;
  scraped_at: string;
  is_seeded: boolean;
}

export interface AvailabilityEvent {
  id: number;
  store_product_id: number;
  product_id: number;
  in_stock: boolean;
  scarcity_text: string | null;
  scraped_at: string;
  is_seeded: boolean;
  prev_in_stock: boolean;
  prev_scraped_at: string;
  title: string;
  store_name: string;
  gap_seconds: string;
}

export interface MapViolation {
  id: number;
  store_product_id: number;
  product_id: number;
  current_price: string;
  scraped_at: string;
  is_seeded: boolean;
  floor_price: string;
  title: string;
  image_url: string | null;
  store_name: string;
  pct_below_floor: string;
}

export interface CollectionRow {
  id: number;
  store_id: number;
  store_name: string;
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
  store_id: number;
  store_name: string;
}

export interface ProductDetail {
  product: {
    id: number;
    canonical_key: string;
    title: string;
    brand: string | null;
    gtin: string | null;
    sku: string | null;
    category: string | null;
    image_url: string | null;
  };
  store_products: Array<{ id: number; store_id: number; store_name: string; product_url: string; region_code: string }>;
  snapshots: Snapshot[];
  availability_events: AvailabilityEvent[];
}

export interface StoreRow {
  id: number;
  name: string;
  country: string | null;
  base_url: string;
  collector_id: string;
  is_active: boolean;
  tracked_products: string;
  last_collection_at: string | null;
}

export interface AlertRow {
  id: number;
  store_product_id: number;
  rule_type: string;
  threshold: string | null;
  channel: string;
  is_active: boolean;
  created_at: string;
  title: string;
  store_name: string;
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
  stores: () => get<StoreRow[]>("/catalog/stores"),
  alerts: () => get<AlertRow[]>("/alerts"),
  createAlert: (body: { store_product_id: number; rule_type: string; threshold?: number }) =>
    post<AlertRow>("/alerts", body),
  deleteAlert: (id: number) => fetch(`${BASE}/alerts/${id}`, { method: "DELETE" }),
  triggerCollection: (storeId: number) =>
    fetch(`${BASE}/catalog/stores/${storeId}/collect`, { method: "POST" }).then((r) => {
      if (!r.ok) throw new Error(`trigger failed: ${r.status}`);
      return r.json();
    }),
  priceIntegrity: () => get<IntegrityRow[]>("/price-integrity"),
  priceIntegrityHistory: (storeProductId: number) =>
    get<Array<{ id: number; scraped_at: string; current_price: string; list_price: string | null; true_30d_low: string; is_seeded: boolean }>>(
      `/price-integrity/${storeProductId}/history`,
    ),
  products: () => get<ProductListRow[]>("/products"),
  product: (id: number) => get<ProductDetail>(`/products/${id}`),
  availabilityEvents: () => get<AvailabilityEvent[]>("/availability/events"),
  availabilityRate: () =>
    get<Array<{ store_name: string; category: string; availability_pct: string }>>("/availability/rate"),
  mapViolations: () => get<MapViolation[]>("/map-violations"),
  collections: () => get<CollectionRow[]>("/scraper-health/collections"),
  fieldCoverage: () => get<FieldCoverageRow[]>("/scraper-health/field-coverage"),
};
