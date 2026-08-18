import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { QueryState } from "@/components/domain/QueryState";
import { SeededBadge } from "@/components/domain/SeededBadge";
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
      <Link to="/" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
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
            <div className="flex items-start gap-4">
              {product.image_url && (
                <img
                  src={product.image_url}
                  alt=""
                  className="h-16 w-16 rounded-lg border border-border object-cover"
                />
              )}
              <div>
                <h1 className="text-xl font-semibold tracking-tight">{product.title}</h1>
                <div className="mt-1 flex gap-2 text-xs text-muted-foreground">
                  {product.category && <span className="capitalize">{product.category}</span>}
                  {store_products.map((sp) => (
                    <span key={sp.id}>· {sp.store_name}</span>
                  ))}
                </div>
              </div>
            </div>

            <Card className="gap-3 p-5">
              <h2 className="text-sm font-medium">Price history</h2>
              {chartData.length > 1 ? (
                <PriceHistoryChart data={chartData} />
              ) : (
                <div className="rounded-lg border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                  Not enough snapshots yet to chart.
                </div>
              )}
            </Card>

            <Card className="gap-3 p-5">
              <h2 className="text-sm font-medium">Availability timeline</h2>
              {availability_events.length === 0 ? (
                <p className="text-xs text-muted-foreground">No stock changes recorded yet.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {availability_events
                    .slice()
                    .reverse()
                    .map((e) => (
                      <li key={e.id} className="flex items-center gap-3 py-2 text-sm">
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

            <Card className="gap-3 p-5">
              <h2 className="text-sm font-medium">Raw snapshots ({snapshots.length})</h2>
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
                        <tr key={s.id} className="border-t border-border">
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
          </div>
        )}
      </QueryState>
    </div>
  );
}
