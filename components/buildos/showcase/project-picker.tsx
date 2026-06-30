"use client"

import { useMemo, useState } from "react"
import { Check, Wand2 } from "lucide-react"
import {
  SHOWCASE_PROJECTS as ALL_SHOWCASE_PROJECTS,
  SHOWCASE_SORTS,
  formatCurrency,
  sortShowcaseProjects,
  type ShowcaseProject,
  type ShowcaseSortKey,
} from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { toggleSelection } from "./config"

const SUGGEST_COUNT = 5

function budgetLabel(v: number) {
  if (v === 0) return "On budget"
  if (v < 0) return `${Math.abs(v).toFixed(1)}% under`
  return `${v.toFixed(1)}% over`
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

export function ProjectPicker({
  selectedIds,
  onChange,
}: {
  selectedIds: string[]
  onChange: (ids: string[]) => void
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

  const filtered = useMemo(() => {
    const list = ALL_SHOWCASE_PROJECTS.filter((p) => {
      if (market !== "all" && p.market !== market) return false
      if (clientType !== "all" && p.clientType !== clientType) return false
      if (delivery !== "all" && p.delivery !== delivery) return false
      return true
    })
    return sortShowcaseProjects(list, sort)
  }, [market, clientType, delivery, sort])

  function suggestTopPerformers() {
    const top = filtered.slice(0, SUGGEST_COUNT).map((p) => p.id)
    onChange(top)
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Sort + suggest */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
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
        <Button variant="outline" size="sm" onClick={suggestTopPerformers} className="shrink-0">
          <Wand2 className="size-3.5" />
          Suggest top performers
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3">
        <FilterChips label="Market" value={market} options={markets} onChange={setMarket} />
        <FilterChips
          label="Client"
          value={clientType}
          options={clientTypes}
          onChange={setClientType}
        />
        <FilterChips
          label="Delivery"
          value={delivery}
          options={deliveries}
          onChange={setDelivery}
        />
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-14 text-center text-sm text-muted-foreground">
          No projects match these filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => (
            <PickerCard
              key={p.id}
              project={p}
              selected={selectedIds.includes(p.id)}
              order={selectedIds.indexOf(p.id)}
              onToggle={() => onChange(toggleSelection(selectedIds, p.id))}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function PickerCard({
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
