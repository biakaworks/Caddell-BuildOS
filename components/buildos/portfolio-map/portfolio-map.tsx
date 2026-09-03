"use client"

import { useEffect, useMemo, useState } from "react"
import dynamic from "next/dynamic"
import { Map as MapIcon, Maximize2, Minimize2 } from "lucide-react"
import {
  PORTFOLIO_SITES,
  SITE_STATUS_META,
  BUSINESS_UNITS,
  formatCurrency,
  type PortfolioSite,
  type SiteStatus,
  type BusinessUnit,
} from "@/lib/mock-data"
import { useApp } from "@/components/buildos/app-context"
import { cn } from "@/lib/utils"

const LeafletMap = dynamic(() => import("./leaflet-map"), {
  ssr: false,
  loading: () => <MapSkeleton />,
})

const CATEGORY_ORDER: SiteStatus[] = ["current", "future", "lead", "office"]

const swatchClass: Record<SiteStatus, string> = {
  current: "bg-primary",
  future: "bg-warning",
  lead: "border-2 border-dashed border-muted-foreground bg-card",
  office: "rounded-[3px] bg-foreground",
}

export function PortfolioMap() {
  const { unit } = useApp()
  const [cats, setCats] = useState<Set<SiteStatus>>(
    () => new Set(CATEGORY_ORDER),
  )
  const [bus, setBus] = useState<Set<BusinessUnit>>(() => new Set(BUSINESS_UNITS))
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  const activeId = selectedId ?? hoveredId

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReducedMotion(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])

  // Lock body scroll + Esc-to-close when expanded.
  useEffect(() => {
    if (!expanded) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setExpanded(false)
    }
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener("keydown", onKey)
    }
  }, [expanded])

  // Sites narrowed by the business-unit dimension only (offices are company-wide
  // and always pass the BU test); used both for counts and the category filter.
  const buScoped = useMemo(() => {
    return PORTFOLIO_SITES.filter((s) => {
      if (s.status === "office") return true
      if (unit !== "All") return s.businessUnit === unit
      return bus.has(s.businessUnit as BusinessUnit)
    })
  }, [unit, bus])

  const counts = useMemo(() => {
    const c: Record<SiteStatus, number> = { current: 0, future: 0, lead: 0, office: 0 }
    for (const s of buScoped) c[s.status] += 1
    return c
  }, [buScoped])

  const visibleSites = useMemo(
    () => buScoped.filter((s) => cats.has(s.status)),
    [buScoped, cats],
  )

  function toggleCat(cat: SiteStatus) {
    setCats((prev) => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }

  function toggleBu(bu: BusinessUnit) {
    setBus((prev) => {
      const next = new Set(prev)
      if (next.has(bu)) next.delete(bu)
      else next.add(bu)
      return next
    })
  }

  function handleSelect(id: string | null) {
    setSelectedId(id)
  }

  const inner = (
    <div className="flex flex-col">
      <Header
        expanded={expanded}
        onToggleExpand={() => setExpanded((v) => !v)}
        unit={unit}
      />

      <Filters
        cats={cats}
        counts={counts}
        onToggleCat={toggleCat}
        bus={bus}
        onToggleBu={toggleBu}
        unit={unit}
      />

      <div
        className={cn(
          "grid grid-cols-1 gap-px overflow-hidden border-t border-border bg-border lg:grid-cols-[1fr_320px]",
          expanded ? "min-h-0 flex-1" : "h-[460px]",
        )}
      >
        {visibleSites.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="relative isolate z-0 bg-muted">
            <LeafletMap
              sites={visibleSites}
              activeId={activeId}
              selectedId={selectedId}
              onSelect={handleSelect}
              onHover={setHoveredId}
              resizeKey={expanded ? "expanded" : "inline"}
              reducedMotion={reducedMotion}
            />
          </div>
        )}

        <SyncedList
          sites={visibleSites}
          activeId={activeId}
          selectedId={selectedId}
          onSelect={handleSelect}
          onHover={setHoveredId}
        />
      </div>
    </div>
  )

  if (expanded) {
    return (
      <>
        {/* Placeholder keeps dashboard layout height while the map is in the overlay */}
        <div className="h-[560px] rounded-2xl border border-dashed border-border bg-card/40" aria-hidden />
        <div
          className="fixed inset-0 z-50 flex flex-col bg-background p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Portfolio map — expanded"
        >
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
            {inner}
          </div>
        </div>
      </>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      {inner}
    </div>
  )
}

function Header({
  expanded,
  onToggleExpand,
  unit,
}: {
  expanded: boolean
  onToggleExpand: () => void
  unit: string
}) {
  return (
    <div className="flex items-center justify-between gap-4 p-4 sm:p-5">
      <div className="flex items-center gap-2.5">
        <span className="flex size-9 items-center justify-center rounded-xl bg-accent text-accent-foreground">
          <MapIcon className="size-5" />
        </span>
        <div>
          <h2 className="font-heading text-base font-semibold tracking-tight text-foreground">
            Portfolio map
          </h2>
          <p className="text-sm text-muted-foreground">
            {unit === "All"
              ? "Current work, awarded projects, active leads, and offices."
              : `Filtered to the ${unit} business unit.`}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onToggleExpand}
        className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-pressed={expanded}
      >
        {expanded ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
        {expanded ? "Collapse" : "Expand"}
      </button>
    </div>
  )
}

function Filters({
  cats,
  counts,
  onToggleCat,
  bus,
  onToggleBu,
  unit,
}: {
  cats: Set<SiteStatus>
  counts: Record<SiteStatus, number>
  onToggleCat: (c: SiteStatus) => void
  bus: Set<BusinessUnit>
  onToggleBu: (b: BusinessUnit) => void
  unit: string
}) {
  return (
    <div className="flex flex-col gap-3 px-4 pb-4 sm:px-5">
      {/* Category chips double as the legend (color + text + count) */}
      <div className="flex flex-wrap items-center gap-1.5">
        {CATEGORY_ORDER.map((cat) => {
          const on = cats.has(cat)
          const meta = SITE_STATUS_META[cat]
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onToggleCat(cat)}
              aria-pressed={on}
              title={meta.description}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                on
                  ? "border-border bg-card text-foreground"
                  : "border-transparent bg-muted text-muted-foreground line-through decoration-muted-foreground/50",
              )}
            >
              <span className={cn("size-2.5 shrink-0 rounded-full", swatchClass[cat], !on && "opacity-40")} />
              {meta.label}
              <span className="tabular-nums text-muted-foreground">{counts[cat]}</span>
            </button>
          )
        })}
      </div>

      {/* Business-unit chips — only when not already scoped by the global switcher */}
      {unit === "All" ? (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Business unit:</span>
          {BUSINESS_UNITS.map((bu) => {
            const on = bus.has(bu)
            return (
              <button
                key={bu}
                type="button"
                onClick={() => onToggleBu(bu)}
                aria-pressed={on}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  on
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : "border-transparent bg-muted text-muted-foreground line-through decoration-muted-foreground/50",
                )}
              >
                {bu}
              </button>
            )
          })}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          Scoped to <span className="font-medium text-foreground">{unit}</span> by the global business-unit
          switcher. Offices are shown company-wide.
        </p>
      )}
    </div>
  )
}

function SyncedList({
  sites,
  activeId,
  selectedId,
  onSelect,
  onHover,
}: {
  sites: PortfolioSite[]
  activeId: string | null
  selectedId: string | null
  onSelect: (id: string | null) => void
  onHover: (id: string | null) => void
}) {
  return (
    <div className="flex min-h-0 flex-col bg-card">
      <div className="border-b border-border px-3 py-2">
        <p className="text-xs font-medium text-muted-foreground">
          {sites.length} {sites.length === 1 ? "site" : "sites"}
        </p>
      </div>
      <ul className="min-h-0 flex-1 overflow-y-auto">
        {sites.map((site) => {
          const active = site.id === activeId
          const pinned = site.id === selectedId
          return (
            <li key={site.id}>
              <button
                type="button"
                onClick={() => onSelect(pinned ? null : site.id)}
                onMouseEnter={() => onHover(site.id)}
                onMouseLeave={() => onHover(null)}
                onFocus={() => onHover(site.id)}
                onBlur={() => onHover(null)}
                aria-pressed={pinned}
                className={cn(
                  "flex w-full items-start gap-2.5 border-b border-border px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                  active ? "bg-accent" : "hover:bg-muted",
                )}
              >
                <span
                  className={cn(
                    "mt-1 size-2.5 shrink-0",
                    swatchClass[site.status],
                    site.status !== "office" && "rounded-full",
                  )}
                  aria-hidden
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium text-foreground">{site.name}</span>
                    <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                      {site.value != null ? formatCurrency(site.value) : "—"}
                    </span>
                  </span>
                  <span className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="truncate">{site.city}</span>
                    <span aria-hidden>·</span>
                    <span className="shrink-0">{SITE_STATUS_META[site.status].label}</span>
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center gap-2 bg-muted/40 p-8 text-center">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <MapIcon className="size-6" />
      </span>
      <p className="text-sm font-medium text-foreground">No sites match these filters</p>
      <p className="max-w-xs text-xs text-muted-foreground">
        Re-enable a category or business unit above to see portfolio locations on the map.
      </p>
    </div>
  )
}

function MapSkeleton() {
  return (
    <div className="flex size-full items-center justify-center bg-muted">
      <div className="flex flex-col items-center gap-3">
        <div className="size-10 animate-pulse rounded-xl bg-muted-foreground/15" />
        <div className="h-2 w-32 animate-pulse rounded-full bg-muted-foreground/15" />
        <div className="h-2 w-24 animate-pulse rounded-full bg-muted-foreground/10" />
        <span className="sr-only">Loading map</span>
      </div>
    </div>
  )
}
