"use client"

import { useState } from "react"
import { ChevronDown, Table2, BarChart3, Plus } from "lucide-react"
import {
  SLIPPED_PROJECTS,
  type PerfMetric,
  type PerfMetricKey,
} from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  BUBreakdownChart,
  DivergingProjectChart,
  MarketBreakdownChart,
  MetricDataTable,
  MetricMainChart,
  StageBreakdownChart,
} from "./perf-charts"

export type DeckType = "internal" | "client"

const deltaTone: Record<PerfMetric["deltaIntent"], string> = {
  good: "bg-success-muted text-success-strong",
  warn: "bg-warning-muted text-warning-strong",
  bad: "bg-danger-muted text-danger-strong",
  neutral: "bg-muted text-muted-foreground",
}

/** Reusable destination menu — internal always; client only for client-safe. */
export function AddToDeckMenu({
  label = "Add to deck",
  variant = "outline",
  size = "sm",
  clientEligible,
  onAdd,
}: {
  label?: string
  variant?: "outline" | "default" | "ghost"
  size?: "sm" | "default"
  clientEligible: boolean
  onAdd: (deck: DeckType) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant={variant} size={size}>
            <Plus className="size-4" />
            {label}
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuItem onClick={() => onAdd("internal")}>
          <div className="flex flex-col">
            <span className="font-medium">Internal leadership deck</span>
            <span className="text-xs text-muted-foreground">Board &amp; leadership review</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={!clientEligible}
          onClick={() => (clientEligible ? onAdd("client") : undefined)}
        >
          <div className="flex flex-col">
            <span className="font-medium">Client capabilities portfolio</span>
            <span className="text-xs text-muted-foreground">
              {clientEligible ? "Client-facing collateral" : "Internal metric — not client-safe"}
            </span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function MetricDetail({ metric }: { metric: PerfMetric }) {
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

function ChartSkeleton() {
  return (
    <div className="space-y-3">
      <div className="h-56 w-full animate-pulse rounded-xl bg-muted motion-reduce:animate-none" />
      <div className="h-52 w-full animate-pulse rounded-xl bg-muted motion-reduce:animate-none" />
    </div>
  )
}

export function MetricSection({
  metric,
  open,
  onToggle,
  selected,
  onToggleSelect,
  onAddToDeck,
  loading,
}: {
  metric: PerfMetric
  open: boolean
  onToggle: () => void
  selected: boolean
  onToggleSelect: (key: PerfMetricKey) => void
  onAddToDeck: (metric: PerfMetric, deck: DeckType) => void
  loading: boolean
}) {
  const [showTable, setShowTable] = useState(false)
  const clientEligible = metric.deck === "both"

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex flex-wrap items-center gap-3 p-4 sm:p-5">
        <label className="flex cursor-pointer items-center gap-2 print-hide">
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onToggleSelect(metric.key)}
            className="size-4 rounded border-border text-primary focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`Select ${metric.label} for a deck`}
          />
        </label>

        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform motion-reduce:transition-none",
              open && "rotate-180",
            )}
          />
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-foreground">
              {metric.label}
            </span>
            <span className="block truncate text-xs text-muted-foreground">
              {metric.deck === "internal" ? "Internal metric" : "Client-safe proof point"}
            </span>
          </span>
        </button>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="font-heading text-xl font-semibold tabular-nums text-foreground">
              {metric.value}
            </div>
            <span
              className={cn(
                "inline-block rounded-full px-2 py-0.5 text-[11px] font-medium",
                deltaTone[metric.deltaIntent],
              )}
            >
              {metric.delta}
            </span>
          </div>
          <div className="print-hide">
            <AddToDeckMenu
              clientEligible={clientEligible}
              onAdd={(deck) => onAddToDeck(metric, deck)}
            />
          </div>
        </div>
      </div>

      {open ? (
        <div className="border-t border-border p-4 sm:p-5">
          <p className="max-w-3xl text-[15px] leading-relaxed text-foreground/85 text-pretty">
            {metric.narrative}
          </p>

          <div className="mt-4 flex items-center justify-between gap-2">
            <h4 className="text-sm font-semibold text-foreground">
              Trailing 12 months · portfolio total
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTable((v) => !v)}
              className="print-hide"
            >
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
                  <h4 className="mb-3 text-sm font-semibold text-foreground">
                    By business unit
                  </h4>
                  <BUBreakdownChart metric={metric} />
                </div>
                <div className="mt-6">
                  <MetricDetail metric={metric} />
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}
    </section>
  )
}
