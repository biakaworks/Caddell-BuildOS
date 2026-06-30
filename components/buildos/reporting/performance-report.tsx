"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { CalendarDays, Download, FileBarChart, Info } from "lucide-react"
import {
  PERFORMANCE_METRICS,
  REPORT_PERIODS,
  DIVISION_ROLLUP,
  type PerfMetric,
  type PerfMetricKey,
  type ReportPeriodId,
} from "@/lib/mock-data"
import { useApp } from "@/components/buildos/app-context"
import { KpiTiles } from "@/components/buildos/dashboard"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { fmtMetric, RollupSmallMultiples } from "./perf-charts"
import { AddToDeckMenu, MetricSection, type DeckType } from "./metric-section"

const UNIT_FIELD: Record<string, "commercial" | "governmental" | "international"> = {
  Commercial: "commercial",
  Governmental: "governmental",
  International: "international",
}

/** Re-scope a metric's headline + total trend to a single business unit. */
function scopeMetric(metric: PerfMetric, unit: string): PerfMetric {
  if (unit === "All") return metric
  const field = UNIT_FIELD[unit]
  if (!field) return metric
  const series = metric.series.map((p) => ({ ...p, total: p[field] ?? p.total }))
  const last = series[series.length - 1].total
  return { ...metric, series, value: fmtMetric(last, metric) }
}

export function PerformanceReport() {
  const { unit } = useApp()
  const router = useRouter()

  const [periodId, setPeriodId] = useState<ReportPeriodId>("q2-2026")
  const [open, setOpen] = useState<Record<PerfMetricKey, boolean>>(() => ({
    activePursuits: true,
    winRate: true,
    projectsInFlight: false,
    scheduleHealth: false,
    budgetVariance: false,
    trir: false,
  }))
  const [selected, setSelected] = useState<Set<PerfMetricKey>>(new Set())
  const [showRollupTable, setShowRollupTable] = useState(false)

  // Brief loading state when the reporting period changes (chart skeletons).
  const [loading, setLoading] = useState(false)
  const period = REPORT_PERIODS.find((p) => p.id === periodId) ?? REPORT_PERIODS[0]

  function changePeriod(id: ReportPeriodId) {
    if (id === periodId) return
    setPeriodId(id)
    setLoading(true)
    window.setTimeout(() => setLoading(false), 650)
  }

  const metrics = useMemo(
    () => PERFORMANCE_METRICS.map((m) => scopeMetric(m, unit)),
    [unit],
  )

  const toggleSelect = (key: PerfMetricKey) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })

  function goToDeck(deck: DeckType, keys: PerfMetricKey[]) {
    if (keys.length === 0) return
    router.push(`/showcase?deck=${deck}&metrics=${keys.join(",")}`)
  }

  const selectedKeys = [...selected]
  const selectedMetrics = PERFORMANCE_METRICS.filter((m) => selected.has(m.key))
  const allSelectedClientSafe =
    selectedMetrics.length > 0 && selectedMetrics.every((m) => m.deck === "both")

  // Auto exec summary referencing the headline movements.
  const get = (k: PerfMetricKey) => PERFORMANCE_METRICS.find((m) => m.key === k)!
  const summary = `This ${period.label} performance report draws on live portfolio data across the trailing twelve months. Win rate climbed to ${get("winRate").value} (${get("winRate").delta}) and active pursuits rose to ${get("activePursuits").value} (${get("activePursuits").delta}), pointing to a strengthening top of funnel. Projects in flight held steady at ${get("projectsInFlight").value}, while schedule health softened to ${get("scheduleHealth").value} (${get("scheduleHealth").delta}). Budget variance sits at ${get("budgetVariance").value} over baseline, and safety continues to lead with a TRIR of ${get("trir").value} (${get("trir").delta}).`

  return (
    <div>
      {/* Report header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-primary">
            <FileBarChart className="size-4" />
            <span className="text-xs font-semibold uppercase tracking-wide">
              Performance Report
            </span>
          </div>
          <h2 className="mt-2 font-heading text-2xl font-semibold tracking-tight text-foreground">
            Portfolio performance · {period.label}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {period.cadence} · Generated from live data ·{" "}
            <span className="font-medium text-foreground">
              Scope: {unit === "All" ? "All business units" : unit}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 print-hide">
          {/* Period selector */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline">
                  <CalendarDays className="size-4" />
                  {period.label}
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              {REPORT_PERIODS.map((p) => (
                <DropdownMenuItem key={p.id} onClick={() => changePeriod(p.id)}>
                  {p.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" onClick={() => window.print()}>
            <Download className="size-4" />
            Export PDF
          </Button>

          {selected.size > 0 ? (
            <AddToDeckMenu
              label={`Add ${selected.size} to deck`}
              variant="default"
              size="default"
              clientEligible={allSelectedClientSafe}
              onAdd={(deck) => goToDeck(deck, selectedKeys)}
            />
          ) : (
            <Button variant="default" disabled>
              Add to deck
            </Button>
          )}
        </div>
      </div>

      {selected.size === 0 ? (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground print-hide">
          <Info className="size-3.5" />
          Select metrics with the checkboxes to add them to a leadership or client deck.
        </p>
      ) : null}

      {/* KPI band (reuses the dashboard tiles) */}
      <div className="mt-6">
        <KpiTiles />
      </div>

      {/* Executive summary */}
      <div className="mt-4 rounded-2xl border border-border bg-accent/40 p-5">
        <h3 className="text-sm font-semibold text-foreground">Executive summary</h3>
        <p className="mt-2 max-w-4xl text-[15px] leading-relaxed text-foreground/85 text-pretty">
          {summary}
        </p>
      </div>

      {/* Metric detail sections */}
      <div className="mt-6 space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Metric detail
        </h3>
        {metrics.map((metric) => (
          <MetricSection
            key={metric.key}
            metric={metric}
            open={open[metric.key]}
            onToggle={() => setOpen((o) => ({ ...o, [metric.key]: !o[metric.key] }))}
            selected={selected.has(metric.key)}
            onToggleSelect={toggleSelect}
            onAddToDeck={(m, deck) => goToDeck(deck, [m.key])}
            loading={loading}
          />
        ))}
      </div>

      {/* Cross-division roll-up */}
      <div className="mt-8">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Cross-division roll-up
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowRollupTable((v) => !v)}
            className="print-hide"
          >
            {showRollupTable ? "Show charts" : "Show data table"}
          </Button>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Commercial, Governmental, and International compared across the headline metrics.
        </p>

        <div className="mt-4">
          {showRollupTable ? (
            <RollupTable />
          ) : (
            <RollupSmallMultiples />
          )}
        </div>
      </div>
    </div>
  )
}

function RollupTable() {
  const cols: { key: keyof (typeof DIVISION_ROLLUP)[number]; label: string; suffix?: string; signed?: boolean }[] = [
    { key: "winRate", label: "Win rate", suffix: "%" },
    { key: "scheduleHealth", label: "Schedule", suffix: "%" },
    { key: "trir", label: "TRIR" },
    { key: "budgetVariance", label: "Budget var.", suffix: "%", signed: true },
    { key: "activePursuits", label: "Pursuits" },
    { key: "projectsInFlight", label: "In flight" },
  ]
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">Cross-division roll-up across headline metrics</caption>
        <thead className="bg-muted/60 text-xs text-muted-foreground">
          <tr>
            <th scope="col" className="px-3 py-2 font-medium">Business unit</th>
            {cols.map((c) => (
              <th key={c.key} scope="col" className="px-3 py-2 text-right font-medium">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {DIVISION_ROLLUP.map((d) => (
            <tr key={d.unit}>
              <th scope="row" className="px-3 py-2 font-medium text-foreground">{d.unit}</th>
              {cols.map((c) => {
                const v = d[c.key] as number
                const display = `${c.signed && v > 0 ? "+" : ""}${v}${c.suffix ?? ""}`
                return (
                  <td key={c.key} className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                    {display}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
