import "dotenv/config";
import { pool } from "./client.js";

/**
 * Generates ~60 days of demo history across two portals so Market Value,
 * Market Activity (days-on-market), and Cross-Portal Matches have something
 * to show without waiting weeks for organic history. Every row this script
 * writes is is_seeded = true — the UI must always label seeded rows, never
 * present them as real scraped data. Live collection (npm run collect)
 * writes real rows on top of this and is what the demo's "pipeline is real"
 * claim rests on.
 *
 * portals.collector_id here is a placeholder ("c_pending_...") until the
 * real Scraper Studio collector exists — swap it for the real id once
 * npm run collect has an actual collector to point at, same as the shop
 * collector was originally a placeholder before its first real run.
 *
 * Each listing below is a deliberately designed scenario, not random filler:
 *   - A 7-listing "Maruti Swift" segment plus a 2-listing "Hyundai Creta"
 *     segment exercise market-value scoring's two verdict paths — a real
 *     comparable-set median (with one planted good deal, one planted
 *     overpriced) vs. INSUFFICIENT_COMPARABLES when a segment is too thin
 *     to trust.
 *   - Four listings (aging-then-sold, fast-sale, aging-active, fresh-with-cut)
 *     exercise delisting-based days-on-market and price-cut tracking.
 *   - One planted cross-portal duplicate (the same physical car, two
 *     portals, two prices) exercises fuzzy matching.
 *   - Two clean CarWale listings exist purely so a second portal isn't empty.
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
const rand = mulberry32(20260819);
const noise = (base: number, pct: number) => base * (1 + (rand() * 2 - 1) * pct);
const round2 = (n: number) => Math.round(n * 100) / 100;

const DAYS = 60;

const PORTALS = {
  cars24: {
    name: "Cars24",
    country: "IN",
    base_url: "https://www.cars24.com/buy-used-car/",
    collector_id: "c_pending_cars24",
  },
  carwale: {
    name: "CarWale",
    country: "IN",
    base_url: "https://www.carwale.com/used/cars-in-delhi/",
    collector_id: "c_pending_carwale",
  },
} as const;
type PortalKey = keyof typeof PORTALS;

interface DayPrice {
  dayIndex: number;
  currentPrice: number;
  originalPrice: number | null;
}

interface SeedListing {
  key: string;
  portal: PortalKey;
  title: string;
  make: string;
  model: string;
  year: number;
  city: string;
  registrationPrefix: string;
  fuelType: string;
  transmission: string;
  sellerType: string;
  odometerKm: number;
  imageUrl: string | null;
  scenario: string;
  firstDay: number;
  lastDay: number; // inclusive; lastDay === DAYS-1 means still active
  days: () => DayPrice[];
  duplicateOfKey?: string;
  matchConfidence?: number;
  needsReview?: boolean;
}

function steadyDays(firstDay: number, lastDay: number, base: number, pct: number): DayPrice[] {
  const rows: DayPrice[] = [];
  for (let i = firstDay; i <= lastDay; i++) {
    rows.push({ dayIndex: i, currentPrice: round2(noise(base, pct)), originalPrice: null });
  }
  return rows;
}

/** Step-cut price with the original (pre-cut) price shown for `showFor` days after each cut. */
function cutSchedule(
  firstDay: number,
  lastDay: number,
  base: number,
  cuts: Array<{ atDay: number; newPrice: number }>,
  showFor = 4,
): DayPrice[] {
  const rows: DayPrice[] = [];
  for (let i = firstDay; i <= lastDay; i++) {
    const applicable = [...cuts].reverse().find((c) => i >= c.atDay);
    const price = applicable ? applicable.newPrice : base;
    const cutJustHappened = applicable && i < applicable.atDay + showFor;
    const priorPrice = applicable
      ? (cuts[cuts.indexOf(applicable) - 1]?.newPrice ?? base)
      : null;
    rows.push({
      dayIndex: i,
      currentPrice: round2(noise(price, 0.005)),
      originalPrice: cutJustHappened ? round2(priorPrice!) : null,
    });
  }
  return rows;
}

const LISTINGS: SeedListing[] = [
  // --- "Maruti Swift" market-value segment (7 comparables) ---
  {
    key: "swift-a", portal: "cars24", title: "2020 Maruti Swift VXI",
    make: "Maruti", model: "Swift", year: 2020, city: "Ahmedabad", registrationPrefix: "GJ-01",
    fuelType: "Petrol", transmission: "Manual", sellerType: "Cars24 Owned Stock",
    odometerKm: 38200, imageUrl: "https://loremflickr.com/800/600/hatchback,silver?lock=7001",
    scenario: "Market-value segment member, priced near the eventual median.",
    firstDay: 0, lastDay: DAYS - 1, days: () => steadyDays(0, DAYS - 1, 520000, 0.015),
  },
  {
    key: "swift-b", portal: "cars24", title: "2019 Maruti Swift ZXI",
    make: "Maruti", model: "Swift", year: 2019, city: "Rajkot", registrationPrefix: "GJ-08",
    fuelType: "Petrol", transmission: "Manual", sellerType: "Cars24 Owned Stock",
    odometerKm: 45100, imageUrl: "https://loremflickr.com/800/600/hatchback,red?lock=7002",
    scenario: "Market-value segment member.",
    firstDay: 0, lastDay: DAYS - 1, days: () => steadyDays(0, DAYS - 1, 540000, 0.015),
  },
  {
    key: "swift-c", portal: "cars24", title: "2020 Maruti Swift LXI",
    make: "Maruti", model: "Swift", year: 2020, city: "Vadodara", registrationPrefix: "GJ-06",
    fuelType: "Petrol", transmission: "Manual", sellerType: "Cars24 Owned Stock",
    odometerKm: 41800, imageUrl: "https://loremflickr.com/800/600/hatchback,white?lock=7003",
    scenario: "Market-value segment member.",
    firstDay: 0, lastDay: DAYS - 1, days: () => steadyDays(0, DAYS - 1, 490000, 0.015),
  },
  {
    key: "swift-d", portal: "cars24", title: "2021 Maruti Swift VXI AMT",
    make: "Maruti", model: "Swift", year: 2021, city: "Surat", registrationPrefix: "GJ-05",
    fuelType: "Petrol", transmission: "Auto", sellerType: "Cars24 Owned Stock",
    odometerKm: 29700, imageUrl: "https://loremflickr.com/800/600/hatchback,blue?lock=7004",
    scenario: "Market-value segment member.",
    firstDay: 0, lastDay: DAYS - 1, days: () => steadyDays(0, DAYS - 1, 560000, 0.015),
  },
  {
    key: "swift-e", portal: "cars24", title: "2019 Maruti Swift ZXI Plus",
    make: "Maruti", model: "Swift", year: 2019, city: "Jaipur", registrationPrefix: "RJ-14",
    fuelType: "Petrol", transmission: "Manual", sellerType: "Cars24 Owned Stock",
    odometerKm: 47300, imageUrl: "https://loremflickr.com/800/600/hatchback,grey?lock=7005",
    scenario: "Market-value segment member.",
    firstDay: 0, lastDay: DAYS - 1, days: () => steadyDays(0, DAYS - 1, 530000, 0.015),
  },
  {
    key: "swift-f", portal: "cars24", title: "2019 Maruti Swift LXI",
    make: "Maruti", model: "Swift", year: 2019, city: "Lucknow", registrationPrefix: "UP-32",
    fuelType: "Petrol", transmission: "Manual", sellerType: "Verified Direct Seller",
    odometerKm: 68900, imageUrl: "https://loremflickr.com/800/600/hatchback,black?lock=7006",
    scenario:
      "PLANTED GOOD_DEAL: priced ~19% below the segment median — high odometer and an " +
      "individual seller wanting a fast sale, a genuinely underpriced comparable.",
    firstDay: 0, lastDay: DAYS - 1, days: () => steadyDays(0, DAYS - 1, 420000, 0.015),
  },
  {
    key: "swift-g", portal: "cars24", title: "2021 Maruti Swift ZXI AMT",
    make: "Maruti", model: "Swift", year: 2021, city: "Chandigarh", registrationPrefix: "PB-10",
    fuelType: "Petrol", transmission: "Auto", sellerType: "Cars24 Owned Stock",
    odometerKm: 22100, imageUrl: "https://loremflickr.com/800/600/hatchback,orange?lock=7007",
    scenario:
      "PLANTED OVERPRICED: priced ~19% above the segment median — low odometer alone " +
      "doesn't justify the asking price relative to six comparable Swifts.",
    firstDay: 0, lastDay: DAYS - 1, days: () => steadyDays(0, DAYS - 1, 630000, 0.015),
  },

  // --- "Hyundai Creta" — deliberately thin segment (2 comparables) ---
  {
    key: "creta-a", portal: "cars24", title: "2020 Hyundai Creta SX",
    make: "Hyundai", model: "Creta", year: 2020, city: "Bangalore", registrationPrefix: "KA-05",
    fuelType: "Diesel", transmission: "Manual", sellerType: "Cars24 Owned Stock",
    odometerKm: 51200, imageUrl: "https://loremflickr.com/800/600/suv,white?lock=7008",
    scenario:
      "INSUFFICIENT_COMPARABLES: only one other Creta exists in this seed, so the " +
      "segment never reaches MIN_COMPARABLES at any widening level — the app must say " +
      "so honestly instead of scoring against 1 other listing.",
    firstDay: 0, lastDay: DAYS - 1, days: () => steadyDays(0, DAYS - 1, 950000, 0.015),
  },
  {
    key: "creta-b", portal: "cars24", title: "2020 Hyundai Creta SX(O)",
    make: "Hyundai", model: "Creta", year: 2020, city: "Mysore", registrationPrefix: "KA-09",
    fuelType: "Diesel", transmission: "Auto", sellerType: "Cars24 Owned Stock",
    odometerKm: 39800, imageUrl: "https://loremflickr.com/800/600/suv,black?lock=7009",
    scenario: "Same thin-segment scenario as creta-a.",
    firstDay: 0, lastDay: DAYS - 1, days: () => steadyDays(0, DAYS - 1, 990000, 0.015),
  },

  // --- Delisting / days-on-market / price-cut scenarios ---
  {
    key: "nexon-aging-sold", portal: "cars24", title: "2018 Tata Nexon XZ",
    make: "Tata", model: "Nexon", year: 2018, city: "Kolkata", registrationPrefix: "WB-02",
    fuelType: "Diesel", transmission: "Manual", sellerType: "Cars24 Owned Stock",
    odometerKm: 61400, imageUrl: "https://loremflickr.com/800/600/suv,red?lock=7010",
    scenario:
      "Aging inventory that eventually sold: three price cuts over 45 days " +
      "(680000 -> 650000 -> 620000 -> 590000) before delisting — the long-days-on-market, " +
      "heavy-markdown case.",
    firstDay: 0, lastDay: 47,
    days: () => cutSchedule(0, 47, 680000, [
      { atDay: 15, newPrice: 650000 },
      { atDay: 30, newPrice: 620000 },
      { atDay: 45, newPrice: 590000 },
    ]),
  },
  {
    key: "city-fast-sale", portal: "cars24", title: "2021 Honda City ZX",
    make: "Honda", model: "City", year: 2021, city: "Indore", registrationPrefix: "MP-20",
    fuelType: "Petrol", transmission: "Auto", sellerType: "Cars24 Owned Stock",
    odometerKm: 24600, imageUrl: "https://loremflickr.com/800/600/sedan,silver?lock=7011",
    scenario:
      "Fast sale, no markdown needed: listed for only 3 days before delisting — the " +
      "contrast case against nexon-aging-sold.",
    firstDay: 54, lastDay: 56, days: () => steadyDays(54, 56, 720000, 0.01),
  },
  {
    key: "duster-aging-active", portal: "cars24", title: "2019 Renault Duster RXZ",
    make: "Renault", model: "Duster", year: 2019, city: "Chennai", registrationPrefix: "TN-09",
    fuelType: "Diesel", transmission: "Manual", sellerType: "Verified Direct Seller",
    odometerKm: 58700, imageUrl: "https://loremflickr.com/800/600/suv,grey?lock=7012",
    scenario:
      "Still active after 52 days with no price cuts yet — the aging-inventory case " +
      "that hasn't sold and hasn't been marked down, feeds the active-longest view.",
    firstDay: 7, lastDay: DAYS - 1, days: () => steadyDays(7, DAYS - 1, 810000, 0.01),
  },
  {
    key: "xuv300-fresh-cut", portal: "cars24", title: "2022 Mahindra XUV300 W8",
    make: "Mahindra", model: "XUV300", year: 2022, city: "Pune", registrationPrefix: "MH-14",
    fuelType: "Petrol", transmission: "Manual", sellerType: "Cars24 Owned Stock",
    odometerKm: 15300, imageUrl: "https://loremflickr.com/800/600/suv,blue?lock=7013",
    scenario:
      "Freshly listed (6 days) with one early price cut already — an early markdown " +
      "signal on a listing that hasn't been up long.",
    firstDay: 54, lastDay: DAYS - 1,
    days: () => cutSchedule(54, DAYS - 1, 950000, [{ atDay: 57, newPrice: 920000 }]),
  },

  // --- Planted cross-portal duplicate ---
  {
    key: "innova-orig", portal: "cars24", title: "2017 Toyota Innova Crysta 2.4 GX",
    make: "Toyota", model: "Innova Crysta", year: 2017, city: "Pune", registrationPrefix: "MH-12",
    fuelType: "Diesel", transmission: "Manual", sellerType: "Verified Direct Seller",
    odometerKm: 72400, imageUrl: "https://loremflickr.com/800/600/mpv,white?lock=7014",
    scenario: "Cross-portal original: individually-owned car, listed on Cars24 first.",
    firstDay: 0, lastDay: DAYS - 1, days: () => steadyDays(0, DAYS - 1, 1250000, 0.008),
  },
  {
    key: "innova-dup", portal: "carwale", title: "Toyota Innova Crysta 2.4 GX 2017",
    make: "Toyota", model: "Innova Crysta", year: 2017, city: "Pune", registrationPrefix: "MH-12",
    fuelType: "Diesel", transmission: "Manual", sellerType: "Individual Seller",
    odometerKm: 72400, imageUrl: "https://loremflickr.com/800/600/mpv,white?lock=7015",
    scenario:
      "PLANTED cross-portal duplicate: same physical car as innova-orig (same reg " +
      "prefix, city, mileage), cross-posted to CarWale 10 days later at a ~5.6% lower " +
      "price. Matched fuzzy (make/model/year/reg-prefix/city), not by VIN — no India " +
      "portal publishes a full VIN on the results grid.",
    firstDay: 10, lastDay: DAYS - 1, days: () => steadyDays(10, DAYS - 1, 1180000, 0.008),
    duplicateOfKey: "innova-orig", matchConfidence: 0.85, needsReview: true,
  },

  // --- Clean CarWale listings, so the second portal isn't empty ---
  {
    key: "seltos-clean", portal: "carwale", title: "2021 Kia Seltos HTX",
    make: "Kia", model: "Seltos", year: 2021, city: "Delhi", registrationPrefix: "DL-01",
    fuelType: "Petrol", transmission: "Auto", sellerType: "Dealer",
    odometerKm: 28900, imageUrl: "https://loremflickr.com/800/600/suv,red?lock=7016",
    scenario: "Clean control: steady pricing on the second portal, no anomalies.",
    firstDay: 0, lastDay: DAYS - 1, days: () => steadyDays(0, DAYS - 1, 1050000, 0.015),
  },
  {
    key: "rapid-clean", portal: "carwale", title: "2018 Skoda Rapid Ambition",
    make: "Skoda", model: "Rapid", year: 2018, city: "Gurgaon", registrationPrefix: "HR-26",
    fuelType: "Petrol", transmission: "Manual", sellerType: "Dealer",
    odometerKm: 54200, imageUrl: "https://loremflickr.com/800/600/sedan,white?lock=7017",
    scenario: "Clean control: proves the system doesn't over-flag everything.",
    firstDay: 0, lastDay: DAYS - 1, days: () => steadyDays(0, DAYS - 1, 610000, 0.015),
  },
];

async function upsertPortal(client: import("pg").PoolClient, portal: (typeof PORTALS)[PortalKey]) {
  const res = await client.query<{ id: number }>(
    `insert into portals (name, country, base_url, collector_id, is_active)
     values ($1, $2, $3, $4, true)
     on conflict (base_url) do nothing
     returning id`,
    [portal.name, portal.country, portal.base_url, portal.collector_id],
  );
  if (res.rows[0]) return res.rows[0].id;
  const existing = await client.query<{ id: number }>(`select id from portals where base_url = $1`, [
    portal.base_url,
  ]);
  return existing.rows[0].id;
}

async function seed() {
  const client = await pool.connect();
  try {
    await client.query("begin");

    const portalIds: Record<PortalKey, number> = {
      cars24: await upsertPortal(client, PORTALS.cars24),
      carwale: await upsertPortal(client, PORTALS.carwale),
    };

    // listing_snapshots is append-only with no dedup constraint, so a second
    // run would silently double every seeded row. Guard explicitly: require
    // --force to re-seed, and clear prior seeded rows (and the listings
    // themselves, since duplicate_of_listing_id and delisted_at are seed-time
    // decisions, not accumulated facts) first when it's passed.
    const existing = await client.query<{ count: string }>(
      `select count(*) from listing_snapshots where is_seeded`,
    );
    if (Number(existing.rows[0].count) > 0) {
      if (!process.argv.includes("--force")) {
        console.log(`seeded data already exists — pass --force to clear and re-seed.`);
        await client.query("rollback");
        return;
      }
      await client.query(`delete from listing_snapshots where is_seeded`);
      await client.query(`delete from listings where is_seeded`);
    }

    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const dayToTimestamp = (dayIndex: number) => new Date(now - (DAYS - 1 - dayIndex) * dayMs);

    const listingIdByKey = new Map<string, number>();

    for (const listing of LISTINGS) {
      console.log(`seeding ${listing.key}: ${listing.scenario}`);

      const externalId = `seed-${listing.key}`;
      const days = listing.days();
      const isActive = listing.lastDay === DAYS - 1;
      const delistedAt = isActive ? null : dayToTimestamp(Math.min(listing.lastDay + 1, DAYS - 1));

      const listingRes = await client.query<{ id: number }>(
        `insert into listings
           (portal_id, external_listing_id, listing_url, title, make, model, year,
            odometer_km, fuel_type, transmission, registration_prefix, city, seller_type,
            main_image_url, is_seeded, first_seen_at, last_seen_at, delisted_at)
         values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, true, $15, $16, $17)
         returning id`,
        [
          portalIds[listing.portal],
          externalId,
          `${PORTALS[listing.portal].base_url}${externalId}/`,
          listing.title,
          listing.make,
          listing.model,
          listing.year,
          listing.odometerKm,
          listing.fuelType,
          listing.transmission,
          listing.registrationPrefix,
          listing.city,
          listing.sellerType,
          listing.imageUrl,
          dayToTimestamp(listing.firstDay).toISOString(),
          dayToTimestamp(listing.lastDay).toISOString(),
          delistedAt ? delistedAt.toISOString() : null,
        ],
      );
      const listingId = listingRes.rows[0].id;
      listingIdByKey.set(listing.key, listingId);

      for (const d of days) {
        await client.query(
          `insert into listing_snapshots
             (listing_id, current_price, original_price, currency, odometer_km, raw_json, scraped_at, is_seeded)
           values ($1, $2, $3, 'INR', $4, $5, $6, true)`,
          [
            listingId,
            d.currentPrice,
            d.originalPrice,
            listing.odometerKm,
            JSON.stringify({ seeded: true, scenario: listing.scenario }),
            dayToTimestamp(d.dayIndex).toISOString(),
          ],
        );
      }
    }

    // Second pass: resolve planted cross-portal duplicates now that every
    // listing has a real id.
    for (const listing of LISTINGS) {
      if (!listing.duplicateOfKey) continue;
      const dupId = listingIdByKey.get(listing.key)!;
      const origId = listingIdByKey.get(listing.duplicateOfKey)!;
      await client.query(
        `update listings set duplicate_of_listing_id = $2, match_confidence = $3, needs_review = $4
         where id = $1`,
        [dupId, origId, listing.matchConfidence ?? null, listing.needsReview ?? false],
      );
    }

    await client.query("commit");
    console.log(`seeded ${LISTINGS.length} listings across ${Object.keys(PORTALS).length} portals`);
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
