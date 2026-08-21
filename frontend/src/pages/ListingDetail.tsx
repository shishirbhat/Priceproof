import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { QueryState } from "@/components/domain/QueryState";
import { SeededBadge } from "@/components/domain/SeededBadge";
import { Panel } from "@/components/domain/Panel";
import { PriceHistoryChart } from "@/components/domain/PriceHistoryChart";
import { ListingCar } from "@/components/domain/ListingCar";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { DUR, EASE_66 } from "@/lib/motion";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Spec-plate row — the metadata treatment borrowed from a racing data sheet. */
function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="rule-t flex items-baseline justify-between gap-4 py-2.5">
      <span className="label-mono">{label}</span>
      <span className="font-mono text-[12px] text-label-1">{value}</span>
    </div>
  );
}

export function ListingDetail() {
  const { listingId } = useParams<{ listingId: string }>();
  const id = Number(listingId);
  const detail = useQuery({ queryKey: ["listing", id], queryFn: () => api.listing(id) });

  const chartData = useMemo(() => {
    if (!detail.data) return [];
    return detail.data.snapshots.map((s) => ({
      date: new Date(s.scraped_at),
      current: Number(s.current_price),
      list: s.original_price != null ? Number(s.original_price) : undefined,
    }));
  }, [detail.data]);

  return (
    <div className="space-y-8">
      <Link to="/" className="group inline-flex items-center gap-2 pt-2">
        <ArrowLeft className="h-3 w-3 text-label-4 transition-all duration-300 group-hover:-translate-x-0.5 group-hover:text-brand" />
        <span className="label-mono transition-colors duration-200 group-hover:text-label-1">
          Command Center
        </span>
      </Link>

      <QueryState
        isLoading={detail.isLoading}
        error={detail.error}
        data={detail.data}
        loadingLabel="Loading listing"
      >
        {({ listing, snapshots, duplicate_of, duplicates }) => {
          const specs: Array<[string, string | null]> = [
            ["Portal", listing.portal_name],
            ["City", listing.city],
            ["Registration", listing.registration_prefix],
            ["Odometer", listing.odometer_km != null ? `${listing.odometer_km.toLocaleString("en-IN")} km` : null],
            ["Fuel", listing.fuel_type],
            ["Transmission", listing.transmission],
            ["Seller", listing.seller_type],
            ["Year", listing.year != null ? String(listing.year) : null],
          ];

          return (
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: DUR.panel, ease: EASE_66 }}
                className="grid gap-6 lg:grid-cols-[minmax(0,460px)_minmax(0,1fr)]"
              >
                {/* Studio render of the car, so every listing presents the
                    same way regardless of what photo the portal supplied. */}
                <ListingCar
                  make={listing.make}
                  model={listing.model}
                  title={listing.title}
                  imageUrl={listing.main_image_url}
                  className="aspect-[16/10] w-full rounded-sm"
                />

                <div className="min-w-0">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="index-numeral">08</span>
                    <span className="label-mono text-label-2">Listing detail</span>
                  </div>

                  <h1 className="display-3 text-foreground">{listing.title}</h1>

                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    {listing.delisted_at ? (
                      <span className="bg-severity-violation/10 px-2.5 py-1.5 font-mono text-[10px] tracking-[0.16em] text-severity-violation uppercase">
                        Delisted {formatDate(listing.delisted_at)}
                      </span>
                    ) : (
                      <span className="bg-severity-genuine/10 px-2.5 py-1.5 font-mono text-[10px] tracking-[0.16em] text-severity-genuine uppercase">
                        Active since {formatDate(listing.first_seen_at)}
                      </span>
                    )}
                    {listing.needs_review && (
                      <span className="bg-severity-drift/10 px-2.5 py-1.5 font-mono text-[10px] tracking-[0.16em] text-severity-drift uppercase">
                        Needs review
                      </span>
                    )}
                    <a
                      href={listing.listing_url}
                      target="_blank"
                      rel="noreferrer"
                      className="group inline-flex items-center gap-1.5 px-2.5 py-1.5 font-mono text-[10px] tracking-[0.16em] text-label-2 uppercase shadow-[inset_0_0_0_1px_var(--hairline-strong)] transition-colors duration-200 hover:text-label-1"
                    >
                      Live listing
                      <ArrowUpRight className="h-3 w-3 text-label-4 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand" />
                    </a>
                  </div>

                  {/* Spec plate. Two columns on wide screens so the metadata
                      reads as a data sheet rather than a paragraph of dots. */}
                  <div className="mt-7 grid gap-x-10 sm:grid-cols-2">
                    {specs
                      .filter(([, v]) => v != null && v !== "")
                      .map(([label, value]) => (
                        <Spec key={label} label={label} value={value as string} />
                      ))}
                  </div>

                  {listing.main_image_url && (
                    <p className="label-mono-sm mt-5">
                      Photograph as published by {listing.portal_name}
                    </p>
                  )}
                </div>
              </motion.div>

              {(duplicate_of || duplicates.length > 0) && (
                <Panel index="01" title="Cross-portal matches" delay={0.04}>
                  <ul className="space-y-2.5">
                    {duplicate_of && (
                      <li className="text-[13px] text-label-2">
                        Same car as{" "}
                        <a
                          href={duplicate_of.listing_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-brand transition-opacity duration-200 hover:opacity-70"
                        >
                          this {duplicate_of.portal_name} listing
                        </a>
                      </li>
                    )}
                    {duplicates.map((d) => (
                      <li key={d.id} className="text-[13px] text-label-2">
                        Also listed on{" "}
                        <a
                          href={d.listing_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-brand transition-opacity duration-200 hover:opacity-70"
                        >
                          {d.portal_name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </Panel>
              )}

              <Panel index="02" title="Price history" delay={0.08}>
                {chartData.length > 1 ? (
                  <PriceHistoryChart data={chartData} />
                ) : (
                  <div className="label-mono rounded-sm border border-dashed border-[var(--hairline-strong)] p-8 text-center">
                    Not enough snapshots yet to chart
                  </div>
                )}
              </Panel>

              <Panel
                index="03"
                title="Raw snapshots"
                meta={`${snapshots.length} rows`}
                delay={0.12}
                bodyClassName="px-0 py-0"
              >
                <div className="max-h-96 overflow-auto">
                  <table className="w-full min-w-[680px] text-left">
                    <thead className="sticky top-0 z-10 bg-surface-1">
                      <tr>
                        {["Date", "Price", "Original price", "Odometer", "Source"].map((h) => (
                          <th key={h} className="label-mono px-5 py-3 font-normal">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="font-mono text-[11.5px]">
                      {snapshots
                        .slice()
                        .reverse()
                        .map((s) => (
                          <tr
                            key={s.id}
                            className="[&>td]:border-t [&>td]:border-[var(--hairline)] transition-colors duration-200 hover:bg-surface-2"
                          >
                            <td className="px-5 py-2.5 tabular-nums text-label-3">
                              {formatDate(s.scraped_at)}
                            </td>
                            <td className="px-5 py-2.5 tabular-nums text-label-1">
                              {formatCurrency(s.current_price)}
                            </td>
                            <td className="px-5 py-2.5 tabular-nums text-label-2">
                              {s.original_price != null ? formatCurrency(s.original_price) : "—"}
                            </td>
                            <td className="px-5 py-2.5 tabular-nums text-label-2">
                              {s.odometer_km != null ? s.odometer_km.toLocaleString("en-IN") : "—"}
                            </td>
                            <td className="px-5 py-2.5">
                              {s.is_seeded ? (
                                <SeededBadge isSeeded />
                              ) : (
                                <span className="text-label-3">live</span>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </Panel>
            </div>
          );
        }}
      </QueryState>
    </div>
  );
}
