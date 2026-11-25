"use client";

import { BarChart3, Table2 } from "lucide-react";
import { useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardHeader } from "@/components/ui/card";
import { ErrorState, Skeleton } from "@/components/ui/feedback";
import { useApiQuery } from "@/hooks/use-api-query";
import { getRevenue } from "@/lib/api/analytics";
import { cn, formatCompactCurrency, formatCurrency, percentChange } from "@/lib/utils";
import type { RevenuePoint, RevenueRange } from "@/types";

const RANGES: { value: RevenueRange; label: string; long: string }[] = [
  { value: "7d", label: "7D", long: "Last 7 days" },
  { value: "30d", label: "30D", long: "Last 30 days" },
  { value: "12m", label: "12M", long: "Last 12 months" },
];

const dailyTooltip = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
const monthlyTooltip = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" });

function formatPointDate(point: RevenuePoint, range: RevenueRange) {
  const date = new Date(point.date);
  return range === "12m" ? monthlyTooltip.format(date) : dailyTooltip.format(date);
}

export function RevenueChart() {
  const [range, setRange] = useState<RevenueRange>("30d");
  const [view, setView] = useState<"chart" | "table">("chart");
  const { data, error, isLoading, isInitialLoading, reload } = useApiQuery(`revenue:${range}`, () =>
    getRevenue(range),
  );

  const change = data ? percentChange(data.total, data.previousTotal) : null;
  const rangeMeta = RANGES.find((r) => r.value === range)!;

  return (
    <Card className="flex flex-col">
      <CardHeader
        title="Revenue"
        description={`${rangeMeta.long}, compared with the period before`}
        action={
          <div className="flex items-center gap-2">
            <div role="group" aria-label="Time range" className="inline-flex rounded-lg border border-line bg-surface-2 p-0.5">
              {RANGES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRange(r.value)}
                  aria-pressed={range === r.value}
                  aria-label={r.long}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-ring",
                    range === r.value ? "bg-surface text-foreground shadow-sm" : "text-muted hover:text-foreground",
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setView(view === "chart" ? "table" : "chart")}
              aria-label={view === "chart" ? "Show data as table" : "Show data as chart"}
              title={view === "chart" ? "Show as table" : "Show as chart"}
              className="rounded-lg border border-line p-1.5 text-muted hover:bg-surface-2 hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
            >
              {view === "chart" ? <Table2 className="size-4" aria-hidden /> : <BarChart3 className="size-4" aria-hidden />}
            </button>
          </div>
        }
      />

      <div className="px-5 pt-4">
        {isInitialLoading ? (
          <Skeleton className="h-9 w-40" />
        ) : data ? (
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1" aria-live="polite">
            <p className="text-3xl font-semibold tracking-tight text-foreground tabular-nums">
              {formatCurrency(data.total)}
            </p>
            {change !== null && (
              <p className={cn("text-sm font-medium tabular-nums", change >= 0 ? "text-success" : "text-danger")}>
                {change >= 0 ? "+" : "−"}
                {Math.abs(change).toFixed(1)}%{" "}
                <span className="font-normal text-muted">vs previous period</span>
              </p>
            )}
          </div>
        ) : null}
      </div>

      <div className={cn("relative px-2 pt-4 pb-4 transition-opacity sm:px-3", isLoading && data && "opacity-60")}>
        {error && !data ? (
          <ErrorState message={error} onRetry={reload} />
        ) : isInitialLoading || !data ? (
          <Skeleton className="mx-3 h-72" />
        ) : view === "table" ? (
          <div className="mx-3 max-h-72 overflow-auto rounded-lg border border-line">
            <table className="w-full text-sm">
              <caption className="sr-only">Revenue, {rangeMeta.long.toLowerCase()}</caption>
              <thead className="sticky top-0 bg-surface-2 text-left text-xs text-muted uppercase">
                <tr>
                  <th scope="col" className="px-3 py-2 font-medium">
                    {range === "12m" ? "Month" : "Date"}
                  </th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {data.points.map((p) => (
                  <tr key={p.date}>
                    <td className="px-3 py-2 text-foreground">{formatPointDate(p, range)}</td>
                    <td className="px-3 py-2 text-right text-foreground tabular-nums">{formatCurrency(p.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="h-72" role="img" aria-label={`Revenue chart, ${rangeMeta.long.toLowerCase()}. Total ${formatCurrency(data.total)}. Use the table view for exact values.`}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.points} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="var(--chart-grid)" strokeWidth={1} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--muted)", fontSize: 12 }}
                  tickMargin={8}
                  minTickGap={20}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--muted)", fontSize: 12 }}
                  tickFormatter={(v: number) => formatCompactCurrency(v)}
                  width={56}
                />
                <Tooltip
                  cursor={{ stroke: "var(--muted)", strokeWidth: 1, strokeOpacity: 0.4 }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const point = payload[0].payload as RevenuePoint;
                    return (
                      <div className="rounded-lg border border-line bg-surface px-3 py-2 text-sm shadow-lg">
                        <p className="text-xs text-muted">{formatPointDate(point, range)}</p>
                        <p className="mt-0.5 flex items-center gap-2 font-semibold text-foreground tabular-nums">
                          <span className="size-2 rounded-full bg-chart-1" aria-hidden />
                          {formatCurrency(point.revenue)}
                        </p>
                      </div>
                    );
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="var(--chart-1)"
                  fillOpacity={0.1}
                  activeDot={{ r: 5, stroke: "var(--surface)", strokeWidth: 2, fill: "var(--chart-1)" }}
                  dot={false}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
        {error && data && (
          <p role="alert" className="mx-3 mt-2 text-sm text-danger">
            {error}
          </p>
        )}
      </div>
    </Card>
  );
}
