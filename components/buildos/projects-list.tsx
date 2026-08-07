"use client"

import { useState } from "react"
import Link from "next/link"
import { PROJECTS, formatCurrency } from "@/lib/data/fixtures"
import { PageContainer, PageHeader, StatusPill, healthTone, Meter } from "./ui"
import type { Sector, State, SystemType } from "@/lib/types"
import { cn } from "@/lib/utils"

const SECTORS: Sector[] = ["Education", "Healthcare", "Commercial", "Industrial", "Hospitality / Civic"]
const STATES: State[] = ["MO", "KS", "AR", "OK"]
const SYSTEMS: SystemType[] = ["Curtain Wall", "Storefront", "Entrances", "Operators", "Specialty Glass", "Glass Replacement"]

const SECTOR_CHIP: Record<Sector, string> = {
  "Education":           "bg-info-muted text-info",
  "Healthcare":          "bg-success-muted text-success-strong",
  "Commercial":          "bg-muted text-muted-foreground",
  "Industrial":          "bg-warning-muted text-warning-strong",
  "Hospitality / Civic": "bg-danger-muted text-danger-strong",
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1 text-xs border transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground",
      )}
    >
      {label}
    </button>
  )
}

export function ProjectsList() {
  const [sector, setSector] = useState<Sector | "All">("All")
  const [state, setState] = useState<State | "All">("All")
  const [system, setSystem] = useState<SystemType | "All">("All")

  const filtered = PROJECTS.filter((p) => {
    if (sector !== "All" && p.sector !== sector) return false
    if (state !== "All" && p.state !== state) return false
    if (system !== "All" && !p.systems.some((s) => s.type === system)) return false
    return true
  }).sort((a, b) => {
    const rank = { Late: 0, "At Risk": 1, "On Schedule": 2 } as const
    return (rank[a.healthStatus] ?? 2) - (rank[b.healthStatus] ?? 2)
  })

  return (
    <PageContainer>
      <PageHeader
        title="Projects"
        subtitle={`${filtered.length} of ${PROJECTS.length} jobs · Commercial Glass & Metal portfolio`}
      />

      {/* Filters */}
      <div className="mt-5 space-y-2.5">
        {[
          { label: "Sector", all: "All" as const, options: SECTORS, val: sector, set: setSector },
          { label: "State",  all: "All" as const, options: STATES,  val: state,  set: setState },
          { label: "System", all: "All" as const, options: SYSTEMS, val: system, set: setSystem },
        ].map(({ label, options, val, set }) => (
          <div key={label} className="flex flex-wrap gap-2 items-center">
            <span className="text-[10px] text-muted-foreground/50 uppercase tracking-widest w-14 shrink-0">
              {label}
            </span>
            <FilterChip label="All" active={val === "All"} onClick={() => set("All" as never)} />
            {(options as string[]).map((o) => (
              <FilterChip key={o} label={o} active={val === o} onClick={() => set(o as never)} />
            ))}
          </div>
        ))}
      </div>

      {/* Card grid */}
      <div className="mt-6 grid gap-px bg-border sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((p) => (
          <Link
            key={p.id}
            href={`/projects/${p.id}`}
            className="group flex flex-col gap-3 bg-card p-4 hover:bg-muted/20 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm text-foreground group-hover:text-primary transition-colors" style={{ letterSpacing: "-0.01em" }}>
                  {p.name}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {p.city}, {p.state} · {p.gc}
                </p>
              </div>
              <StatusPill tone={healthTone(p.healthStatus)} className="shrink-0">{p.healthStatus}</StatusPill>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <span data-pill className={cn("rounded-full px-2 py-0.5 text-[10px]", SECTOR_CHIP[p.sector])}>
                {p.sector}
              </span>
              {p.systems.map((s) => (
                <span key={s.type} data-pill className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
                  {s.type}
                </span>
              ))}
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
                <span>{p.phase}</span>
                <span className="tabular-nums">{p.percentComplete}%</span>
              </div>
              <Meter value={p.percentComplete} tone={healthTone(p.healthStatus)} />
            </div>

            <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t border-border pt-2.5">
              <span className="tabular-nums">{formatCurrency(p.contractValue)}</span>
              <span>
                Install: {new Date(p.installWindowStart).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                {p.hardDeadlineWindow && <span className="ml-1 text-warning">⚑</span>}
              </span>
            </div>

            {p.healthStatus !== "On Schedule" && p.atRiskReason && (
              <p className="text-[11px] text-warning">{p.atRiskReason}</p>
            )}
          </Link>
        ))}
      </div>
    </PageContainer>
  )
}
