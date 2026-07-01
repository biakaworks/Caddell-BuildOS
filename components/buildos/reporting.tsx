"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  CalendarDays,
  Check,
  Info,
  Plus,
  Presentation,
  Search,
  Sparkles,
} from "lucide-react"
import {
  PERFORMANCE_METRICS,
  REPORT_PERIODS,
  type BusinessUnit,
  type PerfMetric,
  type ReportPeriodId,
} from "@/lib/mock-data"
import { useApp } from "@/components/buildos/app-context"
import { PageContainer, PageHeader } from "@/components/buildos/ui"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { fmtMetric, MetricMainChart, RollupSmallMultiples } from "@/components/buildos/reporting/perf-charts"
import { MetricDetailView } from "@/components/buildos/reporting/metric-detail"
import { DIVISION_ROLLUP } from "@/lib/mock-data"
import { blockId } from "@/components/buildos/showcase/config"

const BU_OPTIONS: (BusinessUnit | "All")[] = [
  "All",
  "Commercial",
  "Governmental",
  "International",
]

const UNIT_FIELD: Record<BusinessUnit, "commercial" | "governmental" | "international"> = {
  Commercial: "commercial",
  Governmental: "governmental",
  International: "international",
}

/** Re-scope a metric's headline + total trend to a single business unit. */
function scopeMetric(metric: PerfMetric, unit: BusinessUnit | "All"): PerfMetric {
  if (unit === "All") return metric
  const field = UNIT_FIELD[unit]
  const series = metric.series.map((p) => ({ ...p, total: p[field] ?? p.total }))
  const last = series[series.length - 1].total
  return { ...metric, series, value: fmtMetric(last, metric) }
}

const deltaTone: Record<PerfMetric["deltaIntent"], string> = {
  good: "bg-success-muted text-success-strong",
  warn: "bg-warning-muted text-warning-strong",
  bad: "bg-danger-muted text-danger-strong",
  neutral: "bg-muted text-muted-foreground",
}

export function ReportingView() {
  const { openAsk, stagedBlocks, isStaged, toggleStaged, clearStaged } = useApp()

  const [query, setQuery] = useState("")
  const [unit, setUnit] = useState<BusinessUnit | "All">("All")
  const [periodId, setPeriodId] = useState<ReportPeriodId>("q2-2026")
  const [loading, setLoading] = useState(false)
  const [detailKey, setDetailKey] = useState<string | null>(null)

  const period = REPORT_PERIODS.find((p) => p.id === periodId) ?? REPORT_PERIODS[0]

  function changePeriod(id: ReportPeriodId) {
    if (id === periodId) return
    setPeriodId(id)
    setLoading(true)
    window.setTimeout(() => setLoading(false), 650)
  }

  // Apply the business-unit scope, then the free-text metric filter.
  const scoped = useMemo(
    () => PERFORMANCE_METRICS.map((m) => scopeMetric(m, unit)),
    [unit],
  )
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return scoped
    return scoped.filter((m) => m.label.toLowerCase().includes(q))
  }, [scoped, query])

  const stagedCount = stagedBlocks.length
  const detailMetric = detailKey ? scoped.find((m) => m.key === detailKey) ?? null : null

  return (
    <PageContainer>
      <PageHeader
        title="Reporting"
        subtitle="The chart library. Browse every KPI, view it in detail, and stage charts for the Portfolio Builder."
      >
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" render={<Link href="/showcase" />}>
            <Presentation className="size-4" />
            Portfolio Builder
          </Button>
          <Button
            onClick={() =>
              openAsk("Generate an executive summary of portfolio health by business unit for the board.")
            }
          >
            <Sparkles className="size-4" />
            Generate summary
          </Button>
        </div>
      </PageHeader>

      {/* Filters */}
      <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-xs">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter charts by metric…"
            aria-label="Filter charts by metric"
            className="w-full rounded-lg bg-background py-2 pl-9 pr-3 text-sm text-foreground ring-1 ring-border outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-xs font-medium text-muted-foreground">Business unit</span>
            {BU_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setUnit(opt)}
                aria-pressed={unit === opt}
                className={cn(
                  "rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                  unit === opt
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground ring-1 ring-border hover:text-foreground",
                )}
              >
                {opt}
              </button>
            ))}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" size="sm">
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
        </div>
      </div>

      <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Info className="size-3.5 shrink-0" />
        {period.cadence} · Scope: {unit === "All" ? "All business units" : unit} · Select charts to
        stage them, then open the Portfolio Builder to assemble a deck.
      </p>

      {/* Gallery */}
      {filtered.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-border py-16 text-center">
          <p className="text-sm font-medium text-foreground">No charts match your filter</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try a different search term or clear the filter.
          </p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => setQuery("")}>
            Clear filter
          </Button>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
          {filtered.map((metric) => (
            <MetricLibraryCard
              key={metric.key}
              metric={metric}
              loading={loading}
              staged={isStaged(blockId({ kind: "metric", key: metric.key }))}
              onToggleStage={() => toggleStaged(blockId({ kind: "metric", key: metric.key }))}
              onView={() => setDetailKey(metric.key)}
            />
          ))}
        </div>
      )}

      {/* Cross-division roll-up (view only) */}
      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Cross-division roll-up
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Commercial, Governmental, and International compared across the headline metrics.
        </p>
        <div className="mt-4">
          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {DIVISION_ROLLUP.map((_, i) => (
                <div
                  key={i}
                  className="h-48 animate-pulse rounded-xl border border-border bg-muted motion-reduce:animate-none"
                />
              ))}
            </div>
          ) : (
            <RollupSmallMultiples />
          )}
        </div>
      </section>

      {/* Staging tray */}
      {stagedCount > 0 ? (
        <div className="sticky bottom-0 z-10 mt-8 flex flex-wrap items-center gap-3 border-t border-border bg-background/85 py-3 backdrop-blur">
          <span className="text-sm font-medium text-foreground">
            {stagedCount} chart{stagedCount === 1 ? "" : "s"} staged
          </span>
          <Button variant="ghost" size="sm" onClick={clearStaged}>
            Clear
          </Button>
          <Button className="ms-auto" render={<Link href="/showcase" />}>
            <Presentation className="size-4" />
            Open in Portfolio Builder
          </Button>
        </div>
      ) : null}

      {/* Detail panel */}
      <Sheet open={detailMetric !== null} onOpenChange={(o) => (!o ? setDetailKey(null) : null)}>
        <SheetContent side="right" className="w-full overflow-y-auto p-5 sm:max-w-2xl">
          {detailMetric ? (
            <>
              <SheetHeader className="p-0">
                <SheetTitle className="sr-only">{detailMetric.label} detail</SheetTitle>
                <SheetDescription className="sr-only">
                  Full chart, business-unit breakdown, and data table for {detailMetric.label}.
                </SheetDescription>
              </SheetHeader>
              <MetricDetailView metric={detailMetric} loading={loading} />
              <div className="mt-6 flex items-center justify-end gap-2 border-t border-border pt-4">
                <StageButton
                  staged={isStaged(blockId({ kind: "metric", key: detailMetric.key }))}
                  onToggle={() =>
                    toggleStaged(blockId({ kind: "metric", key: detailMetric.key }))
                  }
                />
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </PageContainer>
  )
}

function StageButton({ staged, onToggle }: { staged: boolean; onToggle: () => void }) {
  return (
    <Button variant={staged ? "outline" : "default"} onClick={onToggle}>
      {staged ? <Check className="size-4" /> : <Plus className="size-4" />}
      {staged ? "Staged for builder" : "Add to Portfolio Builder"}
    </Button>
  )
}

function MetricLibraryCard({
  metric,
  loading,
  staged,
  onToggleStage,
  onView,
}: {
  metric: PerfMetric
  loading: boolean
  staged: boolean
  onToggleStage: () => void
  onView: () => void
}) {
  return (
    <article
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border bg-card transition-colors",
        staged ? "border-primary ring-1 ring-primary" : "border-border",
      )}
    >
      <div className="flex items-start justify-between gap-3 p-5 pb-3">
        <div className="min-w-0">
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {metric.deck === "internal" ? "Internal metric" : "Client-safe proof point"}
          </span>
          <h3 className="mt-1 truncate font-heading text-lg font-semibold text-foreground">
            {metric.label}
          </h3>
        </div>
        <div className="shrink-0 text-right">
          <div className="font-heading text-2xl font-semibold tabular-nums text-foreground">
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

      <div className="px-5">
        {loading ? (
          <div className="h-56 w-full animate-pulse rounded-xl bg-muted motion-reduce:animate-none" />
        ) : (
          <MetricMainChart metric={metric} />
        )}
      </div>

      <p className="mt-3 px-5 text-sm leading-relaxed text-muted-foreground text-pretty">
        {metric.caption}
      </p>

      <div className="mt-4 flex items-center justify-between gap-2 border-t border-border p-3">
        <Button variant="ghost" size="sm" onClick={onView}>
          View detail
        </Button>
        <Button variant={staged ? "outline" : "default"} size="sm" onClick={onToggleStage}>
          {staged ? <Check className="size-4" /> : <Plus className="size-4" />}
          {staged ? "Staged" : "Add to builder"}
        </Button>
      </div>
    </article>
  )
}
