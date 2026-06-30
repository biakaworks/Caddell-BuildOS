"use client"

import { useState } from "react"
import { BarChart3, Table2 } from "lucide-react"
import { SLIPPED_PROJECTS, type PerfMetric } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  BUBreakdownChart,
  DivergingProjectChart,
  MarketBreakdownChart,
  MetricDataTable,
  MetricMainChart,
  StageBreakdownChart,
} from "./perf-charts"

const deltaTone: Record<PerfMetric["deltaIntent"], string> = {
  good: "bg-success-muted text-success-strong",
  warn: "bg-warning-muted text-warning-strong",
  bad: "bg-danger-muted text-danger-strong",
  neutral: "bg-muted text-muted-foreground",
}

function BreakdownCard({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
      <div className="mt-3">{children}</div>
    </div>
  )
}

/** Metric-specific secondary breakdown — the same charts the deck slides draw on. */
function MetricBreakdown({ metric }: { metric: PerfMetric }) {
  switch (metric.key) {
    case "activePursuits":
      return (
        <BreakdownCard title="By pursuit stage" subtitle="Current open pursuits across the pipeline">
          <StageBreakdownChart />
        </BreakdownCard>
      )
    case "winRate":
      return (
        <BreakdownCard title="By market" subtitle="Trailing-12-month win rate vs. industry benchmark">
          <MarketBreakdownChart benchmark={metric.benchmark} />
        </BreakdownCard>
      )
    case "budgetVariance":
      return (
        <BreakdownCard
          title="By project"
          subtitle="Variance from baseline — bars right of zero are over budget"
        >
          <DivergingProjectChart />
        </BreakdownCard>
      )
    case "scheduleHealth":
      return (
        <BreakdownCard title="Projects behind schedule" subtitle="Three projects driving the dip">
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Projects behind schedule and their recovery plans</caption>
              <thead className="bg-muted/60 text-xs text-muted-foreground">
                <tr>
                  <th scope="col" className="px-3 py-2 font-medium">Project</th>
                  <th scope="col" className="px-3 py-2 font-medium">Unit</th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">Slip</th>
                  <th scope="col" className="px-3 py-2 font-medium">Cause</th>
                  <th scope="col" className="px-3 py-2 font-medium">Recovery</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {SLIPPED_PROJECTS.map((p) => (
                  <tr key={p.name}>
                    <th scope="row" className="px-3 py-2 font-medium text-foreground">{p.name}</th>
                    <td className="px-3 py-2 text-muted-foreground">{p.unit}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-warning-strong">
                      +{p.slipWeeks} wk
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{p.cause}</td>
                    <td className="px-3 py-2 text-muted-foreground">{p.recovery}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </BreakdownCard>
      )
    default:
      return null
  }
}

function ChartSkeleton() {
  return (
    <div className="space-y-3">
      <div className="h-56 w-full animate-pulse rounded-xl bg-muted motion-reduce:animate-none" />
      <div className="h-52 w-full animate-pulse rounded-xl bg-muted motion-reduce:animate-none" />
    </div>
  )
}

/**
 * Full read-only detail for one metric chart block: headline, narrative, the
 * trailing-12-month chart, the by-business-unit breakdown, a metric-specific
 * breakdown, and an accessible data-table alternative. Used by the Reporting
 * chart library; it references the shared chart components (single source).
 */
export function MetricDetailView({
  metric,
  loading = false,
}: {
  metric: PerfMetric
  loading?: boolean
}) {
  const [showTable, setShowTable] = useState(false)

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {metric.deck === "internal" ? "Internal metric" : "Client-safe proof point"}
          </span>
          <h3 className="mt-1 font-heading text-2xl font-semibold tracking-tight text-foreground">
            {metric.label}
          </h3>
        </div>
        <div className="text-right">
          <div className="font-heading text-3xl font-semibold tabular-nums text-foreground">
            {metric.value}
          </div>
          <span
            className={cn(
              "mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium",
              deltaTone[metric.deltaIntent],
            )}
          >
            {metric.delta}
          </span>
        </div>
      </div>

      <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-foreground/85 text-pretty">
        {metric.narrative}
      </p>

      <div className="mt-6 flex items-center justify-between gap-2">
        <h4 className="text-sm font-semibold text-foreground">
          Trailing 12 months · portfolio total
        </h4>
        <Button variant="ghost" size="sm" onClick={() => setShowTable((v) => !v)}>
          {showTable ? <BarChart3 className="size-4" /> : <Table2 className="size-4" />}
          {showTable ? "Show chart" : "Show data table"}
        </Button>
      </div>

      <div className="mt-3">
        {loading ? (
          <ChartSkeleton />
        ) : showTable ? (
          <MetricDataTable metric={metric} />
        ) : (
          <>
            <MetricMainChart metric={metric} />
            <div className="mt-6">
              <h4 className="mb-3 text-sm font-semibold text-foreground">By business unit</h4>
              <BUBreakdownChart metric={metric} />
            </div>
            <div className="mt-6">
              <MetricBreakdown metric={metric} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
