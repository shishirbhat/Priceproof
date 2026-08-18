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
import { PackageCheck, PackageX, ArrowLeft } from "lucide-react";

function formatCurrency(v: string | number) {
  return `$${Number(v).toFixed(2)}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ProductDetail() {
  const { productId } = useParams<{ productId: string }>();
  const id = Number(productId);
  const detail = useQuery({ queryKey: ["product", id], queryFn: () => api.product(id) });

  const chartData = useMemo(() => {
    if (!detail.data) return [];
    return detail.data.snapshots.map((s) => ({
      date: new Date(s.scraped_at),
      current: Number(s.current_price),
      list: s.list_price != null ? Number(s.list_price) : undefined,
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
        loadingLabel="Loading product"
      >
        {({ product, store_products, snapshots, availability_events }) => (
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-start gap-4"
            >
              {product.image_url && (
                <img
                  src={product.image_url}
                  alt=""
                  className="h-20 w-20 rounded-xl border border-white/[0.08] object-cover shadow-elevate"
                />
              )}
              <div>
                <div className="mb-1 font-mono text-[11px] tracking-widest text-brand">// PRODUCT DETAIL</div>
                <h1 className="text-[2.25rem] font-bold leading-[1.05] tracking-tighter">{product.title}</h1>
                <div className="mt-2 flex gap-2 text-xs text-muted-foreground">
                  {product.category && <span className="capitalize">{product.category}</span>}
                  {store_products.map((sp) => (
                    <span key={sp.id}>· {sp.store_name}</span>
                  ))}
                </div>
              </div>
            </motion.div>

            <FadeIn delay={0.05}>
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

            <FadeIn delay={0.1}>
              <Card className="gap-3 p-5">
                <h2 className="text-[13px] font-semibold tracking-tight">Availability timeline</h2>
                {availability_events.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No stock changes recorded yet.</p>
                ) : (
                  <ul className="divide-y divide-white/[0.05]">
                    {availability_events
                      .slice()
                      .reverse()
                      .map((e) => (
                        <li
                          key={e.id}
                          className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-white/[0.03]"
                        >
                          {e.in_stock ? (
                            <PackageCheck className="h-4 w-4 shrink-0 text-severity-genuine" />
                          ) : (
                            <PackageX className="h-4 w-4 shrink-0 text-severity-violation" />
                          )}
                          <span>{e.in_stock ? "Restocked" : "Went out of stock"}</span>
                          <span className="text-xs text-muted-foreground">{formatDate(e.scraped_at)}</span>
                          {e.is_seeded && <SeededBadge isSeeded />}
                        </li>
                      ))}
                  </ul>
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
                        <th className="py-1.5 pr-4 font-medium">List price</th>
                        <th className="py-1.5 pr-4 font-medium">In stock</th>
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
                              {s.list_price != null ? formatCurrency(s.list_price) : "—"}
                            </td>
                            <td className="py-1.5 pr-4">{s.in_stock ? "yes" : "no"}</td>
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
