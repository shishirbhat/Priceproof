import "dotenv/config";
import { pool } from "./client.js";

/**
 * Generates ~60 days of demo history for the one confirmed real store
 * (ecommerce-shop-brd.vercel.app / "Alto & Oak") so the Price Integrity, MAP,
 * and Availability features have something to show without waiting three
 * weeks for organic history. Every row this script writes is is_seeded =
 * true — the UI must always label seeded rows, never present them as real
 * scraped data. Live collection (npm run collect) writes real rows on top of
 * this and is what the demo's "pipeline is real" claim rests on.
 *
 * Each product below is a deliberately designed scenario, not random filler
 * — see the comment above each generator. This keeps the demo explainable:
 * every flagged case has a stated reason, and two products are left clean on
 * purpose so the system isn't seen to flag everything.
 *
 * Deterministic PRNG (not Math.random()) so re-running this script produces
 * the same demo data every time.
 */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260817);
const noise = (base: number, pct: number) => base * (1 + (rand() * 2 - 1) * pct);
const round2 = (n: number) => Math.round(n * 100) / 100;

const DAYS = 60;
const STORE = {
  name: "Alto & Oak",
  country: "US",
  base_url: "https://ecommerce-shop-brd.vercel.app",
  collector_id: "c_msw8ijcf1akr6p8vch",
};

interface DaySnapshot {
  dayIndex: number; // 0 = oldest, DAYS-1 = most recent
  currentPrice: number;
  listPrice: number | null;
  inStock: boolean;
  scarcityText: string | null;
}

interface SeedProduct {
  slug: string;
  title: string;
  category: string;
  basePrice: number;
  imageUrl: string | null;
  scenario: string;
  days: (basePrice: number) => DaySnapshot[];
}

function steady(basePrice: number, pct: number): DaySnapshot[] {
  return Array.from({ length: DAYS }, (_, i) => ({
    dayIndex: i,
    currentPrice: round2(noise(basePrice, pct)),
    listPrice: null,
    inStock: true,
    scarcityText: null,
  }));
}

const PRODUCTS: SeedProduct[] = [
  {
    slug: "echo-portable-speaker",
    title: "Echo Portable Speaker",
    category: "electronics",
    basePrice: 83.11,
    imageUrl: "https://loremflickr.com/800/800/speaker,bluetooth?lock=0041&v=131",
    scenario:
      "PLANTED VIOLATION (inflated discount): list_price jumps to 1.35x six days " +
      "before the 'sale', while the true 30-day low stays near the steady price. " +
      "The advertised was-price was never actually charged recently.",
    days: (base) => {
      const rows: DaySnapshot[] = [];
      for (let i = 0; i < DAYS - 6; i++) {
        rows.push({
          dayIndex: i,
          currentPrice: round2(noise(base, 0.03)),
          listPrice: null,
          inStock: true,
          scarcityText: null,
        });
      }
      for (let i = DAYS - 6; i < DAYS; i++) {
        const t = (i - (DAYS - 6)) / 5;
        rows.push({
          dayIndex: i,
          currentPrice: round2(base * (1 - 0.15 * t)),
          listPrice: round2(base * 1.35),
          inStock: true,
          scarcityText: i === DAYS - 1 ? "Recently restocked, going fast." : null,
        });
      }
      return rows;
    },
  },
  {
    slug: "pulse-smartwatch",
    title: "Pulse Smartwatch",
    category: "electronics",
    basePrice: 240.41,
    imageUrl: null,
    scenario:
      "GENUINE discount: the advertised was-price (0.97x) closely matches the " +
      "real recent low, and the markdown to 0.85x is an honest ~12% off.",
    days: (base) => {
      const rows: DaySnapshot[] = [];
      for (let i = 0; i < DAYS - 6; i++) {
        rows.push({
          dayIndex: i,
          currentPrice: round2(noise(base, 0.04)),
          listPrice: null,
          inStock: true,
          scarcityText: null,
        });
      }
      for (let i = DAYS - 6; i < DAYS; i++) {
        rows.push({
          dayIndex: i,
          currentPrice: round2(base * 0.85),
          listPrice: round2(base * 0.97),
          inStock: true,
          scarcityText: null,
        });
      }
      return rows;
    },
  },
  {
    slug: "foundry-cast-iron-skillet",
    title: "Foundry Cast Iron Skillet",
    category: "home-kitchen",
    basePrice: 51.03,
    imageUrl: null,
    scenario:
      "PLANTED VIOLATION (inflated discount), longer 12-day runway and a bigger " +
      "claimed 40% off, to prove the detector catches more than one pattern shape.",
    days: (base) => {
      const rows: DaySnapshot[] = [];
      for (let i = 0; i < DAYS - 12; i++) {
        rows.push({
          dayIndex: i,
          currentPrice: round2(noise(base, 0.03)),
          listPrice: null,
          inStock: true,
          scarcityText: null,
        });
      }
      for (let i = DAYS - 12; i < DAYS; i++) {
        const t = (i - (DAYS - 12)) / 11;
        rows.push({
          dayIndex: i,
          currentPrice: round2(base * (1 - 0.1 * t)),
          listPrice: round2(base * 1.5),
          inStock: true,
          scarcityText: null,
        });
      }
      return rows;
    },
  },
  {
    slug: "kiln-ceramic-mug",
    title: "Kiln Ceramic Mug",
    category: "home-kitchen",
    basePrice: 19.92,
    imageUrl: null,
    scenario:
      "INSUFFICIENT_HISTORY: only the last 5 days are seeded, simulating a " +
      "just-added competitor SKU. It claims a discount today, but there isn't " +
      "enough trailing history yet to verify it either way — the app must say " +
      "so honestly instead of guessing.",
    days: (base) => {
      const rows: DaySnapshot[] = [];
      for (let i = DAYS - 5; i < DAYS; i++) {
        rows.push({
          dayIndex: i,
          currentPrice: round2(base * (i === DAYS - 1 ? 0.85 : 1)),
          listPrice: i === DAYS - 1 ? round2(base * 1.3) : null,
          inStock: true,
          scarcityText: null,
        });
      }
      return rows;
    },
  },
  {
    slug: "dugout-baseball-cap",
    title: "Dugout Baseball Cap",
    category: "apparel",
    basePrice: 26.87,
    imageUrl: null,
    scenario:
      "Stockout/restock: a resolved 7-day stockout mid-window feeds the " +
      "time-to-restock stat, then a second stockout starts 3 days ago and is " +
      "still ongoing today, so the live feed / active-stockouts KPI has a " +
      "current case to show, not just historical ones.",
    days: (base) =>
      Array.from({ length: DAYS }, (_, i) => {
        const outOfStock = (i >= 40 && i < 47) || i >= DAYS - 3;
        return {
          dayIndex: i,
          currentPrice: round2(noise(base, 0.03)),
          listPrice: null,
          inStock: !outOfStock,
          scarcityText: outOfStock ? "Out of stock" : i === 47 ? "Recently restocked, going fast." : null,
        };
      }),
  },
  {
    slug: "everyday-cotton-tee",
    title: "Everyday Cotton Tee",
    category: "apparel",
    basePrice: 28.17,
    imageUrl: null,
    scenario:
      "MAP violation: floor is set at 0.9x base; price dips to 0.75x starting " +
      "9 days ago and is still below floor today, so it shows as an active, " +
      "growing-duration violation rather than a resolved one.",
    days: (base) =>
      Array.from({ length: DAYS }, (_, i) => {
        const belowMap = i >= DAYS - 9;
        return {
          dayIndex: i,
          currentPrice: round2(belowMap ? base * 0.75 : noise(base, 0.02)),
          listPrice: null,
          inStock: true,
          scarcityText: null,
        };
      }),
  },
  {
    slug: "pace-running-shorts",
    title: "Pace Running Shorts",
    category: "apparel",
    basePrice: 43.47,
    imageUrl: null,
    scenario: "Clean control: volatile but honest pricing, no discount claims, no violations.",
    days: (base) => steady(base, 0.08),
  },
  {
    slug: "press-34-french-press",
    title: "Press 34 French Press",
    category: "home-kitchen",
    basePrice: 49.1,
    imageUrl: null,
    scenario: "Clean control: a boring, stable retailer. Proves the system doesn't over-flag.",
    days: (base) => steady(base, 0.015),
  },
  {
    slug: "quiet-fleece-hoodie",
    title: "Quiet Fleece Hoodie",
    category: "apparel",
    basePrice: 62.33,
    imageUrl: null,
    scenario:
      "Combo: a brief 4-day stockout followed by a genuine modest discount, so " +
      "one product's timeline shows both an availability event and a price event.",
    days: (base) => {
      const rows: DaySnapshot[] = [];
      for (let i = 0; i < DAYS; i++) {
        const outOfStock = i >= 50 && i < 54;
        const onSale = i >= DAYS - 6;
        rows.push({
          dayIndex: i,
          currentPrice: round2(onSale ? base * 0.88 : noise(base, 0.03)),
          listPrice: onSale ? round2(base * 0.97) : null,
          inStock: !outOfStock,
          scarcityText: outOfStock ? "Out of stock" : null,
        });
      }
      return rows;
    },
  },
];

async function seed() {
  const client = await pool.connect();
  try {
    await client.query("begin");

    const storeRes = await client.query<{ id: number }>(
      `insert into stores (name, country, base_url, collector_id, is_active)
       values ($1, $2, $3, $4, true)
       on conflict (base_url) do nothing
       returning id`,
      [STORE.name, STORE.country, STORE.base_url, STORE.collector_id],
    );
    let storeId = storeRes.rows[0]?.id;
    if (!storeId) {
      const existing = await client.query<{ id: number }>(
        `select id from stores where base_url = $1`,
        [STORE.base_url],
      );
      storeId = existing.rows[0].id;
    }

    // snapshots is intentionally append-only with no dedup constraint, so a
    // second run would silently double every seeded row. Guard explicitly:
    // require --force to re-seed, and clear prior seeded rows first when it's passed.
    const existing = await client.query<{ count: string }>(
      `select count(*) from snapshots s
       join store_products sp on sp.id = s.store_product_id
       where sp.store_id = $1 and s.is_seeded`,
      [storeId],
    );
    if (Number(existing.rows[0].count) > 0) {
      if (!process.argv.includes("--force")) {
        console.log(
          `store "${STORE.name}" already has seeded snapshots — pass --force to clear and re-seed.`,
        );
        await client.query("rollback");
        return;
      }
      await client.query(
        `delete from snapshots s using store_products sp
         where s.store_product_id = sp.id and sp.store_id = $1 and s.is_seeded`,
        [storeId],
      );
    }

    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    for (const product of PRODUCTS) {
      console.log(`seeding ${product.slug}: ${product.scenario}`);

      const canonicalKey = `t:${product.title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()}`;
      const productRes = await client.query<{ id: number }>(
        `insert into products (canonical_key, title, brand, gtin, sku, category, image_url)
         values ($1, $2, null, null, null, $3, $4)
         on conflict (canonical_key) do update set category = excluded.category
         returning id`,
        [canonicalKey, product.title, product.category, product.imageUrl],
      );
      const productId = productRes.rows[0].id;

      const spRes = await client.query<{ id: number }>(
        `insert into store_products (store_id, product_id, product_url, region_code)
         values ($1, $2, $3, '')
         on conflict (store_id, product_id, region_code)
           do update set product_url = excluded.product_url
         returning id`,
        [storeId, productId, `${STORE.base_url}/product/${product.slug}`],
      );
      const storeProductId = spRes.rows[0].id;

      const snapshots = product.days(product.basePrice);
      for (const s of snapshots) {
        const scrapedAt = new Date(now - (DAYS - 1 - s.dayIndex) * dayMs);
        await client.query(
          `insert into snapshots
             (store_product_id, current_price, list_price, currency, in_stock,
              scarcity_text, raw_json, scraped_at, is_seeded)
           values ($1, $2, $3, 'USD', $4, $5, $6, $7, true)`,
          [
            storeProductId,
            s.currentPrice,
            s.listPrice,
            s.inStock,
            s.scarcityText,
            JSON.stringify({ seeded: true, scenario: product.scenario }),
            scrapedAt.toISOString(),
          ],
        );
      }

      if (product.slug === "everyday-cotton-tee") {
        await client.query(
          `insert into map_policies (product_id, floor_price, currency)
           values ($1, $2, 'USD')
           on conflict (product_id) do update set floor_price = excluded.floor_price`,
          [productId, round2(product.basePrice * 0.9)],
        );
      }
    }

    await client.query("commit");
    console.log(`seeded ${PRODUCTS.length} products x ${DAYS} days for store "${STORE.name}"`);
  } catch (err) {
    await client.query("rollback");
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
