"use client"

import { useMemo, useState } from "react"
import {
  ArrowUpRight,
  Award,
  Filter,
  Flag,
  Search,
  Sparkles,
  Star,
  X,
} from "lucide-react"
import {
  PURSUITS,
  PURSUIT_STAGES,
  formatCurrency,
  type ComparableProject,
  type Pursuit,
  type PursuitStage,
} from "@/lib/mock-data"
import { useApp } from "@/components/buildos/app-context"
import { PageContainer, PageHeader, StatusPill } from "@/components/buildos/ui"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const ACTIVE_STAGES: PursuitStage[] = ["Identified", "Go/No-Go", "Proposal", "Submitted"]

const stageTone: Record<PursuitStage, string> = {
  Identified: "bg-muted text-muted-foreground",
  "Go/No-Go": "bg-warning-muted text-warning-strong",
  Proposal: "bg-info-muted text-info",
  Submitted: "bg-accent text-accent-foreground",
  Won: "bg-success-muted text-success-strong",
  Lost: "bg-danger-muted text-danger-strong",
}

export function PursuitsView() {
  const { unit, openAsk } = useApp()
  const [stageFilter, setStageFilter] = useState<PursuitStage | "Active" | "All">("Active")
  const [query, setQuery] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return PURSUITS.filter((p) => {
      if (unit !== "All" && p.unit !== unit) return false
      if (stageFilter === "Active" && !ACTIVE_STAGES.includes(p.stage)) return false
      if (stageFilter !== "Active" && stageFilter !== "All" && p.stage !== stageFilter) return false
      if (q && !`${p.name} ${p.market} ${p.geography} ${p.captain}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [unit, stageFilter, query])

  const board = useMemo(() => {
    const map: Record<string, Pursuit[]> = {}
    for (const stage of ACTIVE_STAGES) map[stage] = []
    for (const p of filtered) {
      if (map[p.stage]) map[p.stage].push(p)
    }
    return map
  }, [filtered])

  const totals = useMemo(() => {
    const weighted = filtered.reduce((sum, p) => sum + (p.value * p.probability) / 100, 0)
    const total = filtered.reduce((sum, p) => sum + p.value, 0)
    return { weighted, total, count: filtered.length }
  }, [filtered])

  const selected = selectedId ? PURSUITS.find((p) => p.id === selectedId) ?? null : null
  const showBoard = stageFilter === "Active"

  return (
    <PageContainer>
      <PageHeader
        title="Pursuits"
        subtitle="Pipeline across all business units. Weighted by win probability."
      >
        <Button onClick={() => openAsk("Find comparable past projects for an upcoming data center pursuit.")}>
          <Sparkles className="size-4" />
          Ask BuildOS
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SummaryStat label="Open pursuits" value={String(totals.count)} sub="matching filters" />
        <SummaryStat label="Total value" value={formatCurrency(totals.total)} sub="unweighted" />
        <SummaryStat label="Weighted value" value={formatCurrency(totals.weighted)} sub="probability-adjusted" accent />
      </div>

      {/* Controls */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          {(["Active", "All", ...PURSUIT_STAGES] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStageFilter(s)}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                stageFilter === s
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground ring-1 ring-border hover:text-foreground",
              )}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter pursuits…"
            className="h-9 w-full rounded-lg bg-card pl-9 pr-3 text-sm ring-1 ring-border outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>

      {/* Board or list */}
      {showBoard ? (
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {ACTIVE_STAGES.map((stage) => (
            <div key={stage} className="flex flex-col">
              <div className="mb-2 flex items-center justify-between px-1">
                <span className="text-sm font-semibold text-foreground">{stage}</span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground tabular-nums">
                  {board[stage].length}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-2">
                {board[stage].length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border py-8 text-center text-xs text-muted-foreground">
                    No pursuits
                  </div>
                ) : (
                  board[stage].map((p) => (
                    <PursuitCard key={p.id} pursuit={p} onClick={() => setSelectedId(p.id)} active={selectedId === p.id} />
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-5 flex flex-col gap-2">
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
              No pursuits match your filters.
            </div>
          ) : (
            filtered.map((p) => (
              <PursuitRow key={p.id} pursuit={p} onClick={() => setSelectedId(p.id)} active={selectedId === p.id} />
            ))
          )}
        </div>
      )}

      {selected ? <PursuitDetail pursuit={selected} onClose={() => setSelectedId(null)} /> : null}
    </PageContainer>
  )
}

function SummaryStat({
  label,
  value,
  sub,
  accent,
}: {
  label: string
  value: string
  sub: string
  accent?: boolean
}) {
  return (
    <div
      className={cn(
        "rounded-xl bg-card p-4 ring-1 ring-border",
        accent && "bg-primary text-primary-foreground ring-primary",
      )}
    >
      <p className={cn("text-xs font-medium", accent ? "text-primary-foreground/75" : "text-muted-foreground")}>
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
      <p className={cn("text-xs", accent ? "text-primary-foreground/70" : "text-muted-foreground")}>{sub}</p>
    </div>
  )
}

function PursuitCard({ pursuit, onClick, active }: { pursuit: Pursuit; onClick: () => void; active: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group rounded-xl bg-card p-3 text-left ring-1 ring-border transition-all hover:ring-primary/40 hover:shadow-sm",
        active && "ring-2 ring-primary",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold leading-snug text-foreground text-balance">{pursuit.name}</p>
        {pursuit.flagged ? <Flag className="size-3.5 shrink-0 text-warning" aria-label="Flagged" /> : null}
      </div>
      <p className="mt-0.5 text-xs text-muted-foreground">{pursuit.market}</p>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-sm font-semibold tabular-nums text-foreground">{formatCurrency(pursuit.value)}</span>
        <span className="text-xs font-medium tabular-nums text-muted-foreground">{pursuit.probability}% win</span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: `${pursuit.probability}%` }} />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{pursuit.dueLabel}</p>
    </button>
  )
}

function PursuitRow({ pursuit, onClick, active }: { pursuit: Pursuit; onClick: () => void; active: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full flex-col gap-3 rounded-xl bg-card p-4 text-left ring-1 ring-border transition-all hover:ring-primary/40 sm:flex-row sm:items-center sm:justify-between",
        active && "ring-2 ring-primary",
      )}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-foreground">{pursuit.name}</p>
          {pursuit.flagged ? <Flag className="size-3.5 shrink-0 text-warning" aria-label="Flagged" /> : null}
        </div>
        <p className="text-xs text-muted-foreground">
          {pursuit.market} · {pursuit.geography} · Captain {pursuit.captain}
        </p>
      </div>
      <div className="flex items-center gap-5">
        <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", stageTone[pursuit.stage])}>
          {pursuit.stage}
        </span>
        <div className="text-right">
          <p className="text-sm font-semibold tabular-nums text-foreground">{formatCurrency(pursuit.value)}</p>
          <p className="text-xs text-muted-foreground tabular-nums">{pursuit.probability}% win</p>
        </div>
      </div>
    </button>
  )
}

function PursuitDetail({ pursuit, onClose }: { pursuit: Pursuit; onClose: () => void }) {
  const { openAsk } = useApp()
  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-[1px] animate-in fade-in"
        onClick={onClose}
        aria-hidden
      />
      <aside
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col bg-background shadow-2xl ring-1 ring-border animate-in slide-in-from-right duration-300"
        role="dialog"
        aria-label={`${pursuit.name} detail`}
      >
        <header className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div>
            <div className="flex items-center gap-2">
              <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", stageTone[pursuit.stage])}>
                {pursuit.stage}
              </span>
              <span className="text-xs text-muted-foreground">{pursuit.unit}</span>
            </div>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground text-balance">{pursuit.name}</h2>
            <p className="text-sm text-muted-foreground">
              {pursuit.market} · {pursuit.delivery}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close detail"
          >
            <X className="size-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-4">
            <Field label="Est. value" value={formatCurrency(pursuit.value)} />
            <Field label="Win probability" value={`${pursuit.probability}%`} />
            <Field label="Geography" value={pursuit.geography} />
            <Field label="Client" value={pursuit.clientType} />
          </div>

          <p className="mt-5 text-sm leading-relaxed text-foreground/90">{pursuit.summary}</p>

          <div className="mt-4 flex items-center justify-between rounded-xl bg-muted/60 px-4 py-3">
            <div>
              <p className="text-xs text-muted-foreground">Capture captain</p>
              <p className="text-sm font-medium text-foreground">{pursuit.captain}</p>
            </div>
            <p className="text-sm font-medium text-foreground">{pursuit.dueLabel}</p>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Award className="size-4 text-primary" />
              Comparable past projects
            </h3>
            <span className="text-xs text-muted-foreground">{pursuit.comparables.length} found</span>
          </div>

          {pursuit.comparables.length === 0 ? (
            <div className="mt-3 rounded-xl border border-dashed border-border p-5 text-center">
              <p className="text-sm text-muted-foreground">
                No comparable projects matched yet. Ask BuildOS to search adjacent markets and deliveries.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => openAsk(`Find comparable past projects for ${pursuit.name} (${pursuit.market}, ${pursuit.delivery}).`)}
              >
                <Sparkles className="size-4" />
                Find comparables
              </Button>
            </div>
          ) : (
            <div className="mt-3 flex flex-col gap-3">
              {pursuit.comparables.map((c) => (
                <ComparableCard key={c.name + c.year} comparable={c} />
              ))}
            </div>
          )}
        </div>

        <footer className="flex items-center gap-2 border-t border-border px-6 py-4">
          <Button
            className="flex-1"
            onClick={() =>
              openAsk(
                `Draft win themes and a capture strategy for ${pursuit.name} using our comparable ${pursuit.market} projects.`,
              )
            }
          >
            <Sparkles className="size-4" />
            Draft win themes
          </Button>
          <Button variant="outline" className="flex-1">
            <ArrowUpRight className="size-4" />
            Open capture plan
          </Button>
        </footer>
      </aside>
    </>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-foreground tabular-nums">{value}</p>
    </div>
  )
}

function ComparableCard({ comparable }: { comparable: ComparableProject }) {
  return (
    <div className="rounded-xl bg-card p-4 ring-1 ring-border">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">{comparable.name}</p>
          <p className="text-xs text-muted-foreground">
            {comparable.year} · {comparable.value} · {comparable.delivery}
          </p>
        </div>
        <StatusPill tone="success">{comparable.outcome}</StatusPill>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {comparable.winThemes.map((theme) => (
          <span key={theme} className="rounded-md bg-info-muted px-2 py-0.5 text-xs font-medium text-info">
            {theme}
          </span>
        ))}
      </div>

      <p className="mt-3 text-sm text-foreground/90">{comparable.result}</p>

      <div className="mt-3 flex items-start justify-between gap-3 rounded-lg bg-muted/60 px-3 py-2.5">
        <div className="min-w-0">
          <p className="text-xs font-medium text-foreground">
            {comparable.subcontractor.name}
            <span className="font-normal text-muted-foreground"> · {comparable.subcontractor.trade}</span>
          </p>
          <p className="text-xs text-muted-foreground">{comparable.subcontractor.note}</p>
        </div>
        <span className="flex shrink-0 items-center gap-1 rounded-md bg-card px-2 py-1 text-xs font-semibold text-foreground ring-1 ring-border">
          <Star className="size-3 fill-warning text-warning" />
          {comparable.subcontractor.rating.toFixed(1)}
        </span>
      </div>
    </div>
  )
}
