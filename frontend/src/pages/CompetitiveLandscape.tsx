import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { QueryState } from "@/components/domain/QueryState";
import { Card } from "@/components/ui/card";

function formatCurrency(v: string | number) {
  return `$${Number(v).toFixed(2)}`;
}

export function CompetitiveLandscape() {
  const products = useQuery({ queryKey: ["products"], queryFn: api.products });

  const stores = useMemo(() => {
    if (!products.data) return [];
    return Array.from(new Set(products.data.map((p) => p.store_name)));
  }, [products.data]);

  const matrix = useMemo(() => {
    if (!products.data) return [];
    const byProduct = new Map<number, { title: string; image_url: string | null; cells: Map<string, typeof products.data[number]> }>();
    for (const row of products.data) {
      if (!byProduct.has(row.product_id)) {
        byProduct.set(row.product_id, { title: row.title, image_url: row.image_url, cells: new Map() });
      }
      byProduct.get(row.product_id)!.cells.set(row.store_name, row);
    }
    return Array.from(byProduct.entries()).map(([productId, v]) => {
      const prices = Array.from(v.cells.values()).map((c) => Number(c.current_price));
      const spread = prices.length > 1 ? Math.max(...prices) - Math.min(...prices) : 0;
      return { productId, ...v, spread };
    }).sort((a, b) => b.spread - a.spread);
  }, [products.data]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Competitive Landscape</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Matched products across every tracked store, sorted by the widest current price spread.
          {stores.length <= 1 && (
            <span className="text-severity-drift">
              {" "}
              Only one store is currently tracked ({stores[0] ?? "none"}) — spreads will populate once a
              second store is added in Catalog Management.
            </span>
          )}
        </p>
      </div>

      <QueryState
        isLoading={products.isLoading}
        error={products.error}
        data={matrix}
        isEmpty={(d) => d.length === 0}
        emptyTitle="No products tracked yet"
      >
        {(rows) => (
          <Card className="gap-0 overflow-x-auto p-0">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-xs text-muted-foreground">
                <tr>
                  <th className="p-3 font-medium">Product</th>
                  {stores.map((s) => (
                    <th key={s} className="p-3 font-medium">
                      {s}
                    </th>
                  ))}
                  <th className="p-3 font-medium">Spread</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const prices = stores.map((s) => r.cells.get(s));
                  const min = Math.min(...prices.filter(Boolean).map((c) => Number(c!.current_price)));
                  return (
                    <tr key={r.productId} className="border-b border-border last:border-0">
                      <td className="p-3">
                        <Link to={`/products/${r.productId}`} className="font-medium hover:underline">
                          {r.title}
                        </Link>
                      </td>
                      {stores.map((s) => {
                        const cell = r.cells.get(s);
                        const isCheapest = cell && Number(cell.current_price) === min && prices.length > 1;
                        return (
                          <td key={s} className="p-3 font-mono tabular-nums">
                            {cell ? (
                              <span className={isCheapest ? "text-severity-genuine font-medium" : ""}>
                                {formatCurrency(cell.current_price)}
                                {!cell.in_stock && (
                                  <span className="ml-1 text-[10px] text-severity-violation">OOS</span>
                                )}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="p-3 font-mono tabular-nums text-muted-foreground">
                        {r.spread > 0 ? formatCurrency(r.spread) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        )}
      </QueryState>
    </div>
  );
}
