"use client"

import { useMemo, useState } from "react"
import { Check, Lock, Wand2 } from "lucide-react"
import {
  PERFORMANCE_METRICS,
  SHOWCASE_SORTS,
  formatCurrency,
  sortShowcaseProjects,
  type PerfMetric,
  type ShowcaseProject,
  type ShowcaseSortKey,
} from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { MetricMainChart } from "@/components/buildos/reporting/perf-charts"
import {
  ALL_SHOWCASE_PROJECTS,
  hasBlock,
  isClientSafe,
  sameBlock,
  type BlockRef,
  type DeckKind,
} from "./config"

const SUGGEST_COUNT = 5

function budgetLabel(v: number) {
  if (v === 0) return "On budget"
  if (v < 0) return `${Math.abs(v).toFixed(1)}% under`
  return `${v.toFixed(1)}% over`
}

const deltaTone: Record<PerfMetric["deltaIntent"], string> = {
  good: "bg-success-muted text-success-strong",
  warn: "bg-warning-muted text-warning-strong",
  bad: "bg-danger-muted text-danger-strong",
  neutral: "bg-muted text-muted-foreground",
}

function FilterChips<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T | "all"
  options: readonly T[]
  onChange: (v: T | "all") => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="mr-1 text-xs font-medium text-muted-foreground">{label}</span>
      {(["all", ...options] as (T | "all")[]).map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
            value === opt
              ? "bg-primary text-primary-foreground"
              : "bg-card text-muted-foreground ring-1 ring-border hover:text-foreground",
          )}
        >
          {opt === "all" ? "All" : opt}
        </button>
      ))}
    </div>
  )
}

export function BlockPicker({
  kind,
  blocks,
  onToggle,
  addBlocks,
}: {
  kind: DeckKind
  blocks: BlockRef[]
  onToggle: (ref: BlockRef) => void
  addBlocks: (refs: BlockRef[]) => void
}) {
  const [sort, setSort] = useState<ShowcaseSortKey>("value")
  const [market, setMarket] = useState<string>("all")
  const [clientType, setClientType] = useState<string>("all")
  const [delivery, setDelivery] = useState<string>("all")

  const markets = useMemo(
    () => Array.from(new Set(ALL_SHOWCASE_PROJECTS.map((p) => p.market))),
    [],
  )
  const clientTypes = useMemo(
    () => Array.from(new Set(ALL_SHOWCASE_PROJECTS.map((p) => p.clientType))),
    [],
  )
  const deliveries = useMemo(
    () => Array.from(new Set(ALL_SHOWCASE_PROJECTS.map((p) => p.delivery))),
    [],
  )

  const filteredProjects = useMemo(() => {
    const list = ALL_SHOWCASE_PROJECTS.filter((p) => {
      if (market !== "all" && p.market !== market) return false
      if (clientType !== "all" && p.clientType !== clientType) return false
      if (delivery !== "all" && p.delivery !== delivery) return false
      return true
    })
    return sortShowcaseProjects(list, sort)
  }, [market, clientType, delivery, sort])

  function suggestTopProjects() {
    addBlocks(
      filteredProjects
        .slice(0, SUGGEST_COUNT)
        .map((p) => ({ kind: "project", id: p.id }) as BlockRef),
    )
  }

  const orderOf = (ref: BlockRef) => blocks.findIndex((b) => sameBlock(b, ref))

  return (
    <div className="flex flex-col gap-8">
      {/* Performance charts */}
      <section>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h2 className="font-heading text-base font-semibold text-foreground">
              Performance charts
            </h2>
            <p className="text-sm text-muted-foreground">
              The same chart blocks defined in Reporting.{" "}
              {kind === "client"
                ? "Only client-safe metrics can join a client portfolio."
                : "All metrics are available for an internal deck."}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {PERFORMANCE_METRICS.map((metric) => {
            const ref: BlockRef = { kind: "metric", key: metric.key }
            const selected = hasBlock(blocks, ref)
            const allowed = kind === "internal" || isClientSafe(ref)
            return (
              <MetricPickCard
                key={metric.key}
                metric={metric}
                selected={selected}
                order={orderOf(ref)}
                disabled={!allowed}
                onToggle={() => onToggle(ref)}
              />
            )
          })}
        </div>
      </section>

      {/* Project showcases */}
      <section>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h2 className="font-heading text-base font-semibold text-foreground">
              Project showcases
            </h2>
            <p className="text-sm text-muted-foreground">
              Completed projects with client-ready results. Available to both deck types.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={suggestTopProjects} className="shrink-0">
            <Wand2 className="size-3.5" />
            Suggest top {SUGGEST_COUNT}
          </Button>
        </div>

        <div className="mt-4 flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-xs font-medium text-muted-foreground">Sort by</span>
            {SHOWCASE_SORTS.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => setSort(s.key)}
                className={cn(
                  "rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                  sort === s.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground ring-1 ring-border hover:text-foreground",
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
          <FilterChips label="Market" value={market} options={markets} onChange={setMarket} />
          <FilterChips
            label="Client"
            value={clientType}
            options={clientTypes}
            onChange={setClientType}
          />
          <FilterChips label="Delivery" value={delivery} options={deliveries} onChange={setDelivery} />
        </div>

        {filteredProjects.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-border py-14 text-center text-sm text-muted-foreground">
            No projects match these filters.
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filteredProjects.map((p) => {
              const ref: BlockRef = { kind: "project", id: p.id }
              return (
                <ProjectPickCard
                  key={p.id}
                  project={p}
                  selected={hasBlock(blocks, ref)}
                  order={orderOf(ref)}
                  onToggle={() => onToggle(ref)}
                />
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

function MetricPickCard({
  metric,
  selected,
  order,
  disabled,
  onToggle,
}: {
  metric: PerfMetric
  selected: boolean
  order: number
  disabled: boolean
  onToggle: () => void
}) {
  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border bg-card text-left transition-all",
        disabled
          ? "border-border opacity-60"
          : selected
            ? "border-primary ring-2 ring-primary"
            : "border-border hover:border-primary/40 hover:shadow-sm",
      )}
    >
      <button
        type="button"
        onClick={disabled ? undefined : onToggle}
        disabled={disabled}
        aria-pressed={selected}
        aria-disabled={disabled}
        className="flex flex-col text-left disabled:cursor-not-allowed"
      >
        <div className="flex items-start justify-between gap-2 p-3.5 pb-2">
          <div className="min-w-0">
            <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              {metric.deck === "internal" ? "Internal metric" : "Client-safe"}
            </span>
            <h3 className="mt-0.5 truncate text-sm font-semibold text-foreground">
              {metric.label}
            </h3>
          </div>
          <span
            className={cn(
              "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ring-2 transition-colors",
              disabled
                ? "bg-muted text-muted-foreground ring-border"
                : selected
                  ? "bg-primary text-primary-foreground ring-primary"
                  : "bg-card text-transparent ring-border",
            )}
          >
            {disabled ? (
              <Lock className="size-3" />
            ) : selected ? (
              order + 1
            ) : (
              <Check className="size-3.5 text-muted-foreground" />
            )}
          </span>
        </div>
        <div className="flex items-center gap-2 px-3.5">
          <span className="font-heading text-lg font-semibold tabular-nums text-foreground">
            {metric.value}
          </span>
          <span
            className={cn(
              "rounded-full px-1.5 py-0.5 text-[10px] font-medium",
              deltaTone[metric.deltaIntent],
            )}
          >
            {metric.delta}
          </span>
        </div>
        <div className="pointer-events-none mt-2 px-2 pb-2">
          <MetricMainChart metric={metric} />
        </div>
      </button>
      {disabled ? (
        <p className="border-t border-border px-3.5 py-2 text-[11px] text-muted-foreground">
          Internal metric — not client-safe
        </p>
      ) : null}
    </div>
  )
}

function ProjectPickCard({
  project,
  selected,
  order,
  onToggle,
}: {
  project: ShowcaseProject
  selected: boolean
  order: number
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border bg-card text-left transition-all",
        selected
          ? "border-primary ring-2 ring-primary"
          : "border-border hover:border-primary/40 hover:shadow-sm",
      )}
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={project.image || "/placeholder.svg"}
          alt={project.imageAlt}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          loading="lazy"
        />
        <span
          className={cn(
            "absolute right-2.5 top-2.5 flex size-6 items-center justify-center rounded-full text-xs font-semibold ring-2 transition-colors",
            selected
              ? "bg-primary text-primary-foreground ring-primary"
              : "bg-card/90 text-transparent ring-border group-hover:text-muted-foreground",
          )}
        >
          {selected ? order + 1 : <Check className="size-3.5" />}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-3.5">
        <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-primary">
          {project.market}
        </div>
        <h3 className="mt-1 text-sm font-semibold leading-snug text-foreground text-pretty">
          {project.name}
        </h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {project.delivery} · {project.location} · {project.completed}
        </p>
        <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 border-t border-border pt-3">
          <Metric label="Value" value={formatCurrency(project.contractValue)} />
          <Metric label="On time" value={`${project.onTimePct}%`} />
          <Metric label="Budget" value={budgetLabel(project.budgetVariancePct)} />
          <Metric label="TRIR" value={project.trir.toFixed(2)} />
        </div>
      </div>
    </button>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="truncate text-sm font-semibold text-foreground tabular-nums">{value}</div>
    </div>
  )
}
