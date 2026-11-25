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

const AXIS_TICK = { fill: "var(--muted)", fontSize: 11, fontFamily: "var(--font-geist-mono)" };

export function RevenueChart() {
  const [range, setRange] = useState<RevenueRange>("30d");
  const [view, setView] = useState<"chart" | "table">("chart");
  const { data, error, isLoading, isInitialLoading, reload } = useApiQuery(`revenue:${range}`, () =>
    getRevenue(range),
  );

  const change = data ? percentChange(data.total, data.previousTotal) : null;
  const rangeMeta = RANGES.find((r) => r.value === range)!;

  return (
    <Card className="flex h-full flex-col">
      <CardHeader
        title="Revenue"
        description={`${rangeMeta.long}, compared with the period before`}
        action={
          <div className="flex items-center gap-2">
            <div role="group" aria-label="Time range" className="inline-flex rounded-lg bg-surface-2 p-0.5 ring-1 ring-line ring-inset">
              {RANGES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRange(r.value)}
                  aria-pressed={range === r.value}
                  aria-label={r.long}
                  className={cn(
                    "h-7 rounded-md px-2.5 font-mono text-[11px] font-medium tracking-[0.04em] transition-[background-color,color,box-shadow] duration-200 ease-out",
                    range === r.value
                      ? "bg-surface text-foreground shadow-sm ring-1 ring-line"
                      : "text-muted hover:text-foreground",
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
              className="flex size-8 items-center justify-center rounded-lg text-ink-2 ring-1 ring-line-strong ring-inset transition-colors duration-200 hover:bg-foreground/5 hover:text-foreground"
            >
              {view === "chart" ? (
                <Table2 className="size-4" strokeWidth={1.75} aria-hidden />
              ) : (
                <BarChart3 className="size-4" strokeWidth={1.75} aria-hidden />
              )}
            </button>
          </div>
        }
      />

      <div className="px-5 pt-5 sm:px-6">
        {isInitialLoading ? (
          <Skeleton className="h-10 w-48" />
        ) : data ? (
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1" aria-live="polite">
            <p className="text-[2.5rem] leading-none font-semibold tracking-[-0.05em] text-foreground tabular-nums">
              {formatCurrency(data.total)}
            </p>
            {change !== null && (
              <p className="flex items-center gap-2 text-[13px] text-muted">
                <span
                  className={cn(
                    "inline-flex h-5 items-center rounded px-1.5 font-mono text-[11px] font-semibold tabular-nums",
                    change >= 0 ? "bg-success-soft text-success" : "bg-danger-soft text-danger",
                  )}
                >
                  {change >= 0 ? "+" : "−"}
                  {Math.abs(change).toFixed(1)}%
                </span>
                vs previous period
              </p>
            )}
          </div>
        ) : null}
      </div>

      <div className={cn("relative flex-1 px-2 pt-5 pb-4 transition-opacity duration-300 sm:px-3", isLoading && data && "opacity-50")}>
        {error && !data ? (
          <ErrorState message={error} onRetry={reload} />
        ) : isInitialLoading || !data ? (
          <Skeleton className="mx-3 h-72" />
        ) : view === "table" ? (
          <div className="mx-3 max-h-72 overflow-auto rounded-xl ring-1 ring-line">
            <table className="w-full text-sm">
              <caption className="sr-only">Revenue, {rangeMeta.long.toLowerCase()}</caption>
              <thead className="sticky top-0 bg-surface-2 text-left">
                <tr>
                  <th scope="col" className="eyebrow px-3 py-2.5 font-medium">
                    {range === "12m" ? "Month" : "Date"}
                  </th>
                  <th scope="col" className="eyebrow px-3 py-2.5 text-right font-medium">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {data.points.map((p) => (
                  <tr key={p.date} className="hover:bg-background">
                    <td className="px-3 py-2 text-ink-2">{formatPointDate(p, range)}</td>
                    <td className="px-3 py-2 text-right font-mono text-[13px] text-foreground tabular-nums">
                      {formatCurrency(p.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div
            className="h-72"
            role="img"
            aria-label={`Revenue chart, ${rangeMeta.long.toLowerCase()}. Total ${formatCurrency(data.total)}. Use the table view for exact values.`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.points} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenue-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.22} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="var(--chart-grid)" strokeWidth={1} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={AXIS_TICK}
                  tickMargin={10}
                  minTickGap={24}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={AXIS_TICK}
                  tickFormatter={(v: number) => formatCompactCurrency(v)}
                  width={56}
                />
                <Tooltip
                  cursor={{ stroke: "var(--line-strong)", strokeWidth: 1 }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const point = payload[0].payload as RevenuePoint;
                    return (
                      <div className="rounded-lg bg-panel px-3 py-2 text-panel-foreground shadow-lg ring-1 ring-white/5">
                        <p className="font-mono text-[10.5px] tracking-[0.04em] text-panel-muted uppercase">
                          {formatPointDate(point, range)}
                        </p>
                        <p className="mt-1 flex items-center gap-2 text-sm font-semibold tabular-nums">
                          <span className="size-2 rounded-[2px] bg-chart-1" aria-hidden />
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
                  fill="url(#revenue-fill)"
                  activeDot={{ r: 4.5, stroke: "var(--surface)", strokeWidth: 2, fill: "var(--chart-1)" }}
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
