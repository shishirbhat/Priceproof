import { LineChart, Line } from "@/components/charts/line-chart";
import { Grid } from "@/components/charts/grid";
import { XAxis } from "@/components/charts/x-axis";
import { ChartTooltip } from "@/components/charts/tooltip";

export interface PricePoint {
  date: Date;
  current?: number;
  list?: number;
  trueLow?: number;
  [key: string]: unknown;
}

/**
 * Overlays selling price, advertised list price, and the true 30-day low so
 * an inflated "was" price is visually obvious — the list line spiking above
 * the true-low line right before a markdown is the whole story.
 */
export function PriceHistoryChart({ data }: { data: PricePoint[] }) {
  return (
    <LineChart data={data} xDataKey="date" aspectRatio="3 / 1">
      <Grid horizontal />
      <Line dataKey="trueLow" stroke="var(--chart-2)" strokeWidth={1.5} />
      <Line dataKey="list" stroke="var(--severity-violation)" strokeWidth={2} />
      <Line dataKey="current" stroke="var(--chart-1)" strokeWidth={2.5} />
      <XAxis />
      <ChartTooltip />
    </LineChart>
  );
}
