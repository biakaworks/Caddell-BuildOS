"use client"

import { useEffect, useState } from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  BUDGET_VARIANCE_BY_PROJECT,
  DIVISION_ROLLUP,
  PURSUIT_STAGE_BREAKDOWN,
  WIN_RATE_BY_MARKET,
  type PerfMetric,
} from "@/lib/mock-data"

/** Respect the user's reduced-motion preference for chart entrance animation. */
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReduced(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])
  return reduced
}

export function fmtMetric(value: number | null, metric: PerfMetric): string {
  if (value === null || value === undefined) return "—"
  const signed = metric.key === "budgetVariance" && value > 0 ? "+" : ""
  return `${signed}${value.toFixed(metric.decimals)}${metric.unitSuffix}`
}

const buConfig = {
  total: { label: "Portfolio total", color: "var(--chart-1)" },
  commercial: { label: "Commercial", color: "var(--chart-1)" },
  governmental: { label: "Governmental", color: "var(--chart-2)" },
  international: { label: "International", color: "var(--chart-3)" },
} satisfies ChartConfig

/**
 * A padded [min, max] domain so trends read clearly instead of flattening
 * against a 0-baseline. Accounts for any reference line so it stays visible.
 */
function paddedDomain(values: number[], ref?: number): [number, number] {
  const nums = values.filter((v) => Number.isFinite(v))
  if (ref !== undefined) nums.push(ref)
  if (nums.length === 0) return [0, 1]
  const lo = Math.min(...nums)
  const hi = Math.max(...nums)
  const pad = Math.max((hi - lo) * 0.25, Math.abs(hi) * 0.05, 0.05)
  // Don't dip below zero for non-negative metrics.
  const min = lo < 0 ? lo - pad : Math.max(0, lo - pad)
  return [Number(min.toFixed(2)), Number((hi + pad).toFixed(2))]
}

/* --------------------------------------------------------------------------
 * Main trend chart (area / line / bar depending on the metric)
 * ------------------------------------------------------------------------ */
export function MetricMainChart({ metric }: { metric: PerfMetric }) {
  const reduced = usePrefersReducedMotion()
  const config = {
    total: { label: metric.label, color: "var(--chart-1)" },
  } satisfies ChartConfig

  const refLine =
    metric.target !== undefined
      ? { y: metric.target, label: `Target ${metric.target}${metric.unitSuffix}` }
      : metric.benchmark !== undefined
        ? { y: metric.benchmark, label: `Benchmark ${metric.benchmark}${metric.unitSuffix}` }
        : null

  return (
    <ChartContainer config={config} className="aspect-auto h-56 w-full">
      {metric.chart === "area" ? (
        <AreaChart data={metric.series} margin={{ left: 4, right: 12, top: 8 }}>
          <defs>
            <linearGradient id={`fill-${metric.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-total)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="var(--color-total)" stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
          <YAxis tickLine={false} axisLine={false} width={32} fontSize={12} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Area
            dataKey="total"
            type="monotone"
            stroke="var(--color-total)"
            strokeWidth={2}
            fill={`url(#fill-${metric.key})`}
            isAnimationActive={!reduced}
            dot={false}
          />
        </AreaChart>
      ) : metric.chart === "bar" ? (
        <BarChart data={metric.series} margin={{ left: 4, right: 12, top: 8 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
          <YAxis tickLine={false} axisLine={false} width={32} fontSize={12} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="total" fill="var(--color-total)" radius={4} isAnimationActive={!reduced} />
        </BarChart>
      ) : (
        <LineChart data={metric.series} margin={{ left: 4, right: 12, top: 8 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={36}
            fontSize={12}
            domain={paddedDomain(
              metric.series.map((p) => p.total),
              refLine?.y,
            )}
            allowDecimals={metric.decimals > 0}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          {refLine ? (
            <ReferenceLine
              y={refLine.y}
              stroke="var(--muted-foreground)"
              strokeDasharray="6 4"
              strokeWidth={1.5}
              label={{
                value: refLine.label,
                position: "insideTopRight",
                fontSize: 11,
                fill: "var(--muted-foreground)",
              }}
            />
          ) : null}
          <Line
            dataKey="total"
            type="monotone"
            stroke="var(--color-total)"
            strokeWidth={2.5}
            dot={false}
            isAnimationActive={!reduced}
            connectNulls
          />
        </LineChart>
      )}
    </ChartContainer>
  )
}

/* --------------------------------------------------------------------------
 * Business-unit breakdown (three overlaid lines, distinct dash patterns so
 * the series are distinguishable without relying on color alone)
 * ------------------------------------------------------------------------ */
export function BUBreakdownChart({ metric }: { metric: PerfMetric }) {
  const reduced = usePrefersReducedMotion()
  return (
    <ChartContainer config={buConfig} className="aspect-auto h-52 w-full">
      <LineChart data={metric.series} margin={{ left: 4, right: 12, top: 8 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={36}
          fontSize={12}
          domain={paddedDomain(
            metric.series.flatMap((p) =>
              [p.commercial, p.governmental, p.international].filter(
                (v): v is number => v !== null,
              ),
            ),
          )}
          allowDecimals={metric.decimals > 0}
        />
        <Line
          dataKey="commercial"
          type="monotone"
          stroke="var(--color-commercial)"
          strokeWidth={2}
          dot={false}
          isAnimationActive={!reduced}
        />
        <Line
          dataKey="governmental"
          type="monotone"
          stroke="var(--color-governmental)"
          strokeWidth={2}
          strokeDasharray="6 4"
          dot={false}
          isAnimationActive={!reduced}
        />
        <Line
          dataKey="international"
          type="monotone"
          stroke="var(--color-international)"
          strokeWidth={2}
          strokeDasharray="2 3"
          dot={false}
          isAnimationActive={!reduced}
          connectNulls={false}
        />
      </LineChart>
    </ChartContainer>
  )
}

/* --------------------------------------------------------------------------
 * Active Pursuits — stage breakdown bar
 * ------------------------------------------------------------------------ */
export function StageBreakdownChart() {
  const reduced = usePrefersReducedMotion()
  const config = { count: { label: "Pursuits", color: "var(--chart-1)" } } satisfies ChartConfig
  return (
    <ChartContainer config={config} className="aspect-auto h-52 w-full">
      <BarChart
        data={PURSUIT_STAGE_BREAKDOWN}
        layout="vertical"
        margin={{ left: 12, right: 16 }}
      >
        <CartesianGrid horizontal={false} strokeDasharray="3 3" />
        <XAxis type="number" tickLine={false} axisLine={false} fontSize={12} />
        <YAxis
          type="category"
          dataKey="stage"
          tickLine={false}
          axisLine={false}
          width={84}
          fontSize={12}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="count" fill="var(--color-count)" radius={4} isAnimationActive={!reduced} />
      </BarChart>
    </ChartContainer>
  )
}

/* --------------------------------------------------------------------------
 * Win Rate — by market, with benchmark reference
 * ------------------------------------------------------------------------ */
export function MarketBreakdownChart({ benchmark }: { benchmark?: number }) {
  const reduced = usePrefersReducedMotion()
  const config = { rate: { label: "Win rate", color: "var(--chart-2)" } } satisfies ChartConfig
  return (
    <ChartContainer config={config} className="aspect-auto h-52 w-full">
      <BarChart data={WIN_RATE_BY_MARKET} margin={{ left: 4, right: 12, top: 8 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="market" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
        <YAxis tickLine={false} axisLine={false} width={32} fontSize={12} />
        <ChartTooltip content={<ChartTooltipContent />} />
        {benchmark !== undefined ? (
          <ReferenceLine
            y={benchmark}
            stroke="var(--muted-foreground)"
            strokeDasharray="6 4"
            label={{
              value: `Benchmark ${benchmark}%`,
              position: "insideTopRight",
              fontSize: 11,
              fill: "var(--muted-foreground)",
            }}
          />
        ) : null}
        <Bar dataKey="rate" fill="var(--color-rate)" radius={4} isAnimationActive={!reduced} />
      </BarChart>
    </ChartContainer>
  )
}

/* --------------------------------------------------------------------------
 * Budget Variance — diverging bars by project around a zero baseline.
 * Over budget = danger; under = success. Sign in labels avoids color-only.
 * ------------------------------------------------------------------------ */
export function DivergingProjectChart() {
  const reduced = usePrefersReducedMotion()
  const config = { variancePct: { label: "Variance", color: "var(--chart-1)" } } satisfies ChartConfig
  const max = Math.max(...BUDGET_VARIANCE_BY_PROJECT.map((p) => Math.abs(p.variancePct))) + 0.6
  return (
    <ChartContainer config={config} className="aspect-auto h-64 w-full">
      <BarChart
        data={BUDGET_VARIANCE_BY_PROJECT}
        layout="vertical"
        margin={{ left: 12, right: 24 }}
        stackOffset="sign"
      >
        <CartesianGrid horizontal={false} strokeDasharray="3 3" />
        <XAxis type="number" domain={[-max, max]} tickLine={false} axisLine={false} fontSize={12} />
        <YAxis
          type="category"
          dataKey="name"
          tickLine={false}
          axisLine={false}
          width={150}
          fontSize={11}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ReferenceLine x={0} stroke="var(--foreground)" strokeWidth={1} />
        <Bar dataKey="variancePct" radius={3} isAnimationActive={!reduced}>
          {BUDGET_VARIANCE_BY_PROJECT.map((p) => (
            <Cell
              key={p.name}
              fill={p.variancePct > 0 ? "var(--chart-5)" : "var(--chart-3)"}
            />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}

/* --------------------------------------------------------------------------
 * Cross-division roll-up — one mini grouped bar per headline metric
 * ------------------------------------------------------------------------ */
const ROLLUP_PANELS = [
  { key: "winRate", label: "Win rate", suffix: "%" },
  { key: "scheduleHealth", label: "Schedule health", suffix: "%" },
  { key: "trir", label: "Safety TRIR", suffix: "" },
  { key: "budgetVariance", label: "Budget variance", suffix: "%" },
  { key: "activePursuits", label: "Active pursuits", suffix: "" },
  { key: "projectsInFlight", label: "Projects in flight", suffix: "" },
] as const

const rollupConfig = {
  Commercial: { label: "Commercial", color: "var(--chart-1)" },
  Governmental: { label: "Governmental", color: "var(--chart-2)" },
  International: { label: "International", color: "var(--chart-3)" },
} satisfies ChartConfig

export function RollupSmallMultiples() {
  const reduced = usePrefersReducedMotion()
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {ROLLUP_PANELS.map((panel) => {
        const data = DIVISION_ROLLUP.map((d) => ({
          unit: d.unit,
          value: d[panel.key as keyof typeof d] as number,
        }))
        return (
          <div key={panel.key} className="rounded-xl border border-border bg-card p-4">
            <h4 className="text-sm font-semibold text-foreground">{panel.label}</h4>
            <ChartContainer config={rollupConfig} className="mt-2 aspect-auto h-40 w-full">
              <BarChart data={data} margin={{ left: 4, right: 8, top: 8 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="unit"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={6}
                  fontSize={11}
                  tickFormatter={(v: string) => v.slice(0, 4)}
                />
                <YAxis tickLine={false} axisLine={false} width={28} fontSize={11} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" radius={4} isAnimationActive={!reduced}>
                  {data.map((d) => (
                    <Cell
                      key={d.unit}
                      fill={
                        d.unit === "Commercial"
                          ? "var(--chart-1)"
                          : d.unit === "Governmental"
                            ? "var(--chart-2)"
                            : "var(--chart-3)"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </div>
        )
      })}
    </div>
  )
}

/* --------------------------------------------------------------------------
 * Accessible data-table alternative for any metric's 12-month series
 * ------------------------------------------------------------------------ */
export function MetricDataTable({ metric }: { metric: PerfMetric }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">
          {metric.label} — monthly values by business unit over the trailing twelve months
        </caption>
        <thead className="bg-muted/60 text-xs text-muted-foreground">
          <tr>
            <th scope="col" className="px-3 py-2 font-medium">
              Month
            </th>
            <th scope="col" className="px-3 py-2 text-right font-medium">
              Total
            </th>
            <th scope="col" className="px-3 py-2 text-right font-medium">
              Commercial
            </th>
            <th scope="col" className="px-3 py-2 text-right font-medium">
              Governmental
            </th>
            <th scope="col" className="px-3 py-2 text-right font-medium">
              International
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {metric.series.map((pt) => (
            <tr key={pt.month}>
              <th scope="row" className="px-3 py-1.5 font-medium text-foreground">
                {pt.month}
              </th>
              <td className="px-3 py-1.5 text-right tabular-nums text-foreground">
                {fmtMetric(pt.total, metric)}
              </td>
              <td className="px-3 py-1.5 text-right tabular-nums text-muted-foreground">
                {fmtMetric(pt.commercial, metric)}
              </td>
              <td className="px-3 py-1.5 text-right tabular-nums text-muted-foreground">
                {fmtMetric(pt.governmental, metric)}
              </td>
              <td className="px-3 py-1.5 text-right tabular-nums text-muted-foreground">
                {fmtMetric(pt.international, metric)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
