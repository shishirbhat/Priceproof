import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { api } from "@/lib/api";
import { QueryState } from "@/components/domain/QueryState";
import { SeededBadge } from "@/components/domain/SeededBadge";
import { FadeIn } from "@/components/domain/FadeIn";
import { PriceHistoryChart } from "@/components/domain/PriceHistoryChart";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

function formatCurrency(v: string | number) {
  return `₹${Number(v).toLocaleString("en-IN")}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
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
    <div className="space-y-6">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> Back to Command Center
      </Link>

      <QueryState
        isLoading={detail.isLoading}
        error={detail.error}
        data={detail.data}
        loadingLabel="Loading listing"
      >
        {({ listing, snapshots, duplicate_of, duplicates }) => (
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-start gap-4"
            >
              {listing.main_image_url && (
                <img
                  src={listing.main_image_url}
                  alt=""
                  className="h-20 w-20 rounded-xl border border-white/[0.08] object-cover shadow-elevate"
                />
              )}
              <div>
                <div className="mb-1 font-mono text-[11px] tracking-widest text-brand">// LISTING DETAIL</div>
                <h1 className="text-[2.25rem] font-bold leading-[1.05] tracking-tighter">{listing.title}</h1>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span>{listing.portal_name}</span>
                  {listing.city && <span>· {listing.city}</span>}
                  {listing.registration_prefix && <span>· {listing.registration_prefix}</span>}
                  {listing.odometer_km != null && <span>· {listing.odometer_km.toLocaleString("en-IN")} km</span>}
                  {listing.fuel_type && <span>· {listing.fuel_type}</span>}
                  {listing.transmission && <span>· {listing.transmission}</span>}
                  {listing.seller_type && <span>· {listing.seller_type}</span>}
                  <a
                    href={listing.listing_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-0.5 text-brand transition-colors hover:text-brand/80"
                  >
                    · view live listing <ArrowUpRight className="h-3 w-3" />
                  </a>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  {listing.delisted_at ? (
                    <span className="rounded-full border border-severity-violation/25 bg-severity-violation/10 px-2 py-0.5 text-[11px] font-medium text-severity-violation">
                      Delisted {formatDate(listing.delisted_at)}
                    </span>
                  ) : (
                    <span className="rounded-full border border-severity-genuine/25 bg-severity-genuine/10 px-2 py-0.5 text-[11px] font-medium text-severity-genuine">
                      Active since {formatDate(listing.first_seen_at)}
                    </span>
                  )}
                  {listing.needs_review && (
                    <span className="rounded-full border border-severity-drift/25 bg-severity-drift/10 px-2 py-0.5 text-[11px] font-medium text-severity-drift">
                      needs review
                    </span>
                  )}
                </div>
              </div>
            </motion.div>

            {(duplicate_of || duplicates.length > 0) && (
              <FadeIn delay={0.04}>
                <Card className="gap-2 p-5">
                  <h2 className="text-[13px] font-semibold tracking-tight">Cross-portal matches</h2>
                  <ul className="space-y-1.5">
                    {duplicate_of && (
                      <li className="text-sm">
                        Same car as{" "}
                        <a href={duplicate_of.listing_url} target="_blank" rel="noreferrer" className="text-brand hover:underline">
                          this {duplicate_of.portal_name} listing
                        </a>
                      </li>
                    )}
                    {duplicates.map((d) => (
                      <li key={d.id} className="text-sm">
                        Also listed on{" "}
                        <a href={d.listing_url} target="_blank" rel="noreferrer" className="text-brand hover:underline">
                          {d.portal_name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </Card>
              </FadeIn>
            )}

            <FadeIn delay={0.08}>
              <Card className="gap-3 p-5">
                <h2 className="text-[13px] font-semibold tracking-tight">Price history</h2>
                {chartData.length > 1 ? (
                  <PriceHistoryChart data={chartData} />
                ) : (
                  <div className="rounded-lg border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                    Not enough snapshots yet to chart.
                  </div>
                )}
              </Card>
            </FadeIn>

            <FadeIn delay={0.15}>
              <Card className="gap-3 p-5">
                <h2 className="text-[13px] font-semibold tracking-tight">
                  Raw snapshots ({snapshots.length})
                </h2>
                <div className="max-h-80 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 bg-card text-muted-foreground">
                      <tr>
                        <th className="py-1.5 pr-4 font-medium">Date</th>
                        <th className="py-1.5 pr-4 font-medium">Price</th>
                        <th className="py-1.5 pr-4 font-medium">Original price</th>
                        <th className="py-1.5 pr-4 font-medium">Odometer</th>
                        <th className="py-1.5 font-medium">Source</th>
                      </tr>
                    </thead>
                    <tbody className="font-mono">
                      {snapshots
                        .slice()
                        .reverse()
                        .map((s) => (
                          <tr key={s.id} className="border-t border-white/[0.05] hover:bg-white/[0.02]">
                            <td className="py-1.5 pr-4 text-muted-foreground">{formatDate(s.scraped_at)}</td>
                            <td className="py-1.5 pr-4 tabular-nums">{formatCurrency(s.current_price)}</td>
                            <td className="py-1.5 pr-4 tabular-nums">
                              {s.original_price != null ? formatCurrency(s.original_price) : "—"}
                            </td>
                            <td className="py-1.5 pr-4 tabular-nums">
                              {s.odometer_km != null ? s.odometer_km.toLocaleString("en-IN") : "—"}
                            </td>
                            <td className="py-1.5">{s.is_seeded ? <SeededBadge isSeeded /> : "live"}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </FadeIn>
          </div>
        )}
      </QueryState>
    </div>
  );
}
