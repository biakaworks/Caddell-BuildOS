"use client"

import { useMemo } from "react"
import { Sparkles } from "lucide-react"
import { UNIT_ROLLUPS, formatCurrency, type UnitRollup } from "@/lib/mock-data"
import { useApp } from "@/components/buildos/app-context"
import { PageContainer, PageHeader } from "@/components/buildos/ui"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function ReportingView() {
  const { unit, openAsk } = useApp()

  const rollups = useMemo(
    () => UNIT_ROLLUPS.filter((r) => unit === "All" || r.unit === unit),
    [unit],
  )

  const totals = useMemo(() => {
    const all = UNIT_ROLLUPS.filter((r) => unit === "All" || r.unit === unit)
    const backlog = all.reduce((s, r) => s + r.backlog, 0)
    const pipeline = all.reduce((s, r) => s + r.pipeline, 0)
    const projects = all.reduce((s, r) => s + r.activeProjects, 0)
    const winRate = Math.round(all.reduce((s, r) => s + r.winRate, 0) / all.length)
    return { backlog, pipeline, projects, winRate }
  }, [unit])

  const maxBacklog = Math.max(...UNIT_ROLLUPS.map((r) => r.backlog))

  return (
    <PageContainer>
      <PageHeader
        title="Reporting"
        subtitle="Executive roll-up across business units. Backlog, pipeline, schedule, budget, and safety."
      >
        <Button onClick={() => openAsk("Generate an executive summary of portfolio health by business unit for the board.")}>
          <Sparkles className="size-4" />
          Generate summary
        </Button>
      </PageHeader>

      {/* Portfolio totals */}
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <BigStat label="Total backlog" value={formatCurrency(totals.backlog)} />
        <BigStat label="Active pipeline" value={formatCurrency(totals.pipeline)} />
        <BigStat label="Active projects" value={String(totals.projects)} />
        <BigStat label="Blended win rate" value={`${totals.winRate}%`} />
      </div>

      {/* Backlog by unit */}
      <div className="mt-6 rounded-2xl bg-card p-5 ring-1 ring-border">
        <h3 className="text-sm font-semibold text-foreground">Backlog by business unit</h3>
        <div className="mt-4 space-y-4">
          {rollups.map((r) => (
            <div key={r.unit}>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">{r.unit}</span>
                <span className="tabular-nums text-muted-foreground">{formatCurrency(r.backlog)}</span>
              </div>
              <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: `${(r.backlog / maxBacklog) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Per-unit scorecards */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {rollups.map((r) => (
          <UnitScorecard key={r.unit} rollup={r} />
        ))}
      </div>
    </PageContainer>
  )
}

function BigStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-card p-4 ring-1 ring-border">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums text-foreground">{value}</p>
    </div>
  )
}

function UnitScorecard({ rollup }: { rollup: UnitRollup }) {
  return (
    <div className="rounded-2xl bg-card p-5 ring-1 ring-border">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-foreground">{rollup.unit}</h3>
        <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground tabular-nums">
          {rollup.activeProjects} active
        </span>
      </div>
      <dl className="mt-4 space-y-3">
        <Gauge label="Schedule health" value={rollup.scheduleHealth} target={85} suffix="%" higherBetter />
        <Gauge
          label="Budget variance"
          value={rollup.budgetVariance}
          target={2}
          suffix="%"
          higherBetter={false}
          signed
        />
        <Gauge label="Safety TRIR" value={rollup.trir} target={0.75} higherBetter={false} decimals={2} />
        <Gauge label="Win rate" value={rollup.winRate} target={40} suffix="%" higherBetter />
      </dl>
    </div>
  )
}

function Gauge({
  label,
  value,
  target,
  suffix = "",
  higherBetter,
  signed,
  decimals = 0,
}: {
  label: string
  value: number
  target: number
  suffix?: string
  higherBetter: boolean
  signed?: boolean
  decimals?: number
}) {
  const good = higherBetter ? value >= target : value <= target
  const rounded = Number(value.toFixed(decimals))
  const normalized = Object.is(rounded, -0) ? 0 : rounded
  const display = `${signed && normalized > 0 ? "+" : ""}${normalized.toFixed(decimals)}${suffix}`
  return (
    <div className="flex items-center justify-between">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="flex items-center gap-2">
        <span className={cn("size-1.5 rounded-full", good ? "bg-success" : "bg-warning")} />
        <span className={cn("text-sm font-semibold tabular-nums", good ? "text-foreground" : "text-warning-strong")}>
          {display}
        </span>
      </dd>
    </div>
  )
}
