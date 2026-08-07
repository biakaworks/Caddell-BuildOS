"use client"

import Link from "next/link"
import { AlertTriangle, ChevronRight, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  PROJECTS,
  ACTIVE_PROJECTS,
  SHUTDOWN_PROJECTS,
  ACTIVITY,
  formatCurrency,
} from "@/lib/data/fixtures"
import { StatTile, StatusPill, SectionHeading, healthTone, statusToTone, Meter, PhaseTrack } from "./ui"

// ─── Stat Row ─────────────────────────────────────────────────────────────
export function PulseStatRow() {
  const active = ACTIVE_PROJECTS.length
  const onSchedule = ACTIVE_PROJECTS.filter((p) => p.healthStatus === "On Schedule").length
  const atRisk = ACTIVE_PROJECTS.filter((p) => p.healthStatus === "At Risk" || p.healthStatus === "Late").length

  // installs "this week" = events with dates touching Aug 7–14 2026
  const installsThisWeek = PROJECTS.filter(
    (p) =>
      (p.phase === "Install" || p.phase === "Fabrication") &&
      new Date(p.installWindowStart) <= new Date("2026-08-14") &&
      new Date(p.installWindowEnd) >= new Date("2026-08-07")
  ).length

  return (
    <div className="grid grid-cols-2 gap-px bg-border lg:grid-cols-4">
      <StatTile label="Active Jobs" value={active} tone="neutral" />
      <StatTile label="On Schedule" value={onSchedule} tone="success" />
      <StatTile
        label="At Risk / Late"
        value={atRisk}
        tone={atRisk > 0 ? "warning" : "success"}
      />
      <StatTile label="Installs This Week" value={installsThisWeek} tone="info" />
    </div>
  )
}

// ─── Schedule Pressure Strip ──────────────────────────────────────────────
const SHUTDOWN_START = new Date("2027-06-01")
const SHUTDOWN_END = new Date("2027-08-07")
const WINDOW_DAYS = (SHUTDOWN_END.getTime() - SHUTDOWN_START.getTime()) / 86_400_000

function daysFrom(dateStr: string) {
  const d = new Date(dateStr)
  return Math.round((d.getTime() - SHUTDOWN_START.getTime()) / 86_400_000)
}

export function SchedulePressureStrip() {
  const edProjects = PROJECTS.filter(
    (p) =>
      p.sector === "Education" &&
      new Date(p.installWindowEnd) > SHUTDOWN_START &&
      new Date(p.installWindowStart) < SHUTDOWN_END
  )

  return (
    <div className="border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <SectionHeading
          title="K-12 + Higher Ed — Summer 2027 Shutdown Window"
          description="June 1 – Aug 7, 2027 · School-year constraint"
        />
        <span className="text-[11px] text-muted-foreground">
          {edProjects.length} education jobs in window
        </span>
      </div>
      <div className="px-4 py-5">
        {/* Window label */}
        <div className="relative mb-1 h-5">
          <div
            className="absolute inset-y-0 flex items-center justify-center bg-primary/10 border-x border-primary/30"
            style={{ left: "0%", width: "100%" }}
          >
            <span className="text-[10px] text-primary/70 tracking-widest uppercase">
              SUMMER SHUTDOWN WINDOW
            </span>
          </div>
        </div>

        {/* Timeline rows */}
        <div className="space-y-1">
          {edProjects.map((p) => {
            const startOff = Math.max(0, daysFrom(p.installWindowStart))
            const endOff = Math.min(WINDOW_DAYS, daysFrom(p.installWindowEnd))
            const leftPct = (startOff / WINDOW_DAYS) * 100
            const widthPct = Math.max(2, ((endOff - startOff) / WINDOW_DAYS) * 100)
            const tone = healthTone(p.healthStatus)
            const barColor =
              tone === "success"
                ? "bg-success"
                : tone === "warning"
                ? "bg-warning"
                : "bg-danger"

            return (
              <div key={p.id} className="flex items-center gap-3">
                <div className="w-44 shrink-0 min-w-0">
                  <Link
                    href={`/projects/${p.id}`}
                    className="block truncate text-[11px] text-foreground hover:text-primary"
                  >
                    {p.name}
                  </Link>
                  <span className="text-[10px] text-muted-foreground">
                    {p.city}, {p.state}
                  </span>
                </div>
                <div className="relative flex-1 h-5 bg-muted">
                  <div
                    className={cn("absolute inset-y-0 h-5", barColor)}
                    style={{
                      left: `${leftPct}%`,
                      width: `${widthPct}%`,
                    }}
                  />
                  {p.healthStatus !== "On Schedule" && (
                    <div
                      className="absolute inset-y-0 flex items-center"
                      style={{ left: `${leftPct + widthPct / 2}%` }}
                    >
                      <AlertTriangle className="size-3 text-warning" />
                    </div>
                  )}
                </div>
                <StatusPill tone={tone} className="shrink-0">
                  {p.healthStatus}
                </StatusPill>
              </div>
            )
          })}
        </div>

        {/* Axis labels */}
        <div className="mt-2 flex justify-between text-[10px] text-muted-foreground/60">
          <span>Jun 1, 2027</span>
          <span>Jul 4, 2027</span>
          <span>Aug 7, 2027</span>
        </div>
      </div>
    </div>
  )
}

// ─── Exceptions Panel ─────────────────────────────────────────────────────
const EXCEPTIONS = [
  {
    id: "exc-1",
    projectId: "bentonville-hs",
    project: "Bentonville High School",
    message: "IGU #B-214 failed seal inspection — re-order placed (PO #B-214-R), 14-day vendor lead",
    nextAction: "Confirm delivery date with Trulite Glass rep — call by Aug 9",
    severity: "danger" as const,
    age: "Today, 9:00 am",
  },
  {
    id: "exc-2",
    projectId: "joplin-hs",
    project: "Joplin High School",
    message: "Extrusion order (PO #4417) delayed 3 weeks — fabrication plan at risk",
    nextAction: "Source alternate extrusion supplier or compress Assemble stage",
    severity: "warning" as const,
    age: "2 days ago",
  },
  {
    id: "exc-3",
    projectId: "millennium-fitness",
    project: "Millennium Family Fitness",
    message: "Punch list — 6 open items. Lobby entrance sealant and hardware punch delayed by GC access",
    nextAction: "Coordinate site access with Tom Ricker (Wilder) — target Aug 12",
    severity: "warning" as const,
    age: "Yesterday",
  },
  {
    id: "exc-4",
    projectId: "bentonville-hs",
    project: "Bentonville HS — Storefront",
    message: "Submittal SUB-SF Rev 1 returned Revise & Resubmit — sill detail at Entry 3",
    nextAction: "Update detail and resubmit Rev 2 to Polk Stanley Wilcox",
    severity: "warning" as const,
    age: "Aug 3",
  },
]

export function ExceptionsPanel() {
  return (
    <div className="border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <SectionHeading title="Needs Attention Today" />
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-danger-muted px-1.5 text-[11px] text-danger tabular-nums">
            {EXCEPTIONS.length}
          </span>
        </div>
      </div>
      <ul className="divide-y divide-border">
        {EXCEPTIONS.map((exc) => (
          <li key={exc.id}>
            <Link
              href={`/projects/${exc.projectId}`}
              className="flex items-start gap-3 px-4 py-3.5 hover:bg-muted/40 transition-colors"
            >
              <AlertTriangle
                className={cn(
                  "mt-0.5 size-4 shrink-0",
                  exc.severity === "danger" ? "text-danger" : "text-warning",
                )}
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground mb-0.5">{exc.project}</p>
                <p className="text-sm text-foreground">{exc.message}</p>
                <p className="mt-1 text-xs text-primary">
                  Next action: {exc.nextAction}
                </p>
              </div>
              <div className="shrink-0 flex flex-col items-end gap-1">
                <StatusPill tone={exc.severity}>
                  {exc.severity === "danger" ? "Critical" : "At Risk"}
                </StatusPill>
                <span className="text-[10px] text-muted-foreground">{exc.age}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ─── Active Projects Table ─────────────────────────────────────────────────
export function ActiveProjectsTable() {
  // At-risk first, then sort by install window
  const sorted = [...ACTIVE_PROJECTS].sort((a, b) => {
    const rankA = a.healthStatus === "Late" ? 0 : a.healthStatus === "At Risk" ? 1 : 2
    const rankB = b.healthStatus === "Late" ? 0 : b.healthStatus === "At Risk" ? 1 : 2
    if (rankA !== rankB) return rankA - rankB
    return new Date(a.installWindowStart).getTime() - new Date(b.installWindowStart).getTime()
  })

  return (
    <div className="border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <SectionHeading title="Active Projects" />
        <Link
          href="/projects"
          className="flex items-center gap-1 text-xs text-primary hover:underline"
        >
          View all <ChevronRight className="size-3" />
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-2.5 text-left text-[11px] text-muted-foreground font-normal uppercase tracking-wider">Job</th>
              <th className="px-4 py-2.5 text-left text-[11px] text-muted-foreground font-normal uppercase tracking-wider hidden md:table-cell">Phase</th>
              <th className="px-4 py-2.5 text-left text-[11px] text-muted-foreground font-normal uppercase tracking-wider hidden lg:table-cell">% Done</th>
              <th className="px-4 py-2.5 text-left text-[11px] text-muted-foreground font-normal uppercase tracking-wider hidden lg:table-cell">Install Window</th>
              <th className="px-4 py-2.5 text-left text-[11px] text-muted-foreground font-normal uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sorted.map((p) => (
              <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/projects/${p.id}`} className="hover:text-primary">
                    <p className="text-foreground">{p.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {p.city}, {p.state} · {p.gc}
                    </p>
                    {p.healthStatus !== "On Schedule" && p.atRiskReason && (
                      <p className="mt-0.5 text-[11px] text-warning">{p.atRiskReason}</p>
                    )}
                  </Link>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className="text-xs text-muted-foreground">{p.phase}</span>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <div className="flex items-center gap-2">
                    <Meter value={p.percentComplete} tone={healthTone(p.healthStatus)} className="w-20" />
                    <span className="text-xs text-muted-foreground tabular-nums">{p.percentComplete}%</span>
                  </div>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(p.installWindowStart).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  {" – "}
                  {new Date(p.installWindowEnd).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  {p.hardDeadlineWindow && (
                    <span className="ml-1 text-warning/80">⚑</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <StatusPill tone={healthTone(p.healthStatus)}>
                    {p.healthStatus}
                  </StatusPill>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Activity Feed ─────────────────────────────────────────────────────────
export function ActivityFeed() {
  return (
    <div className="border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <SectionHeading title="Recent Activity" />
      </div>
      <ul className="divide-y divide-border">
        {ACTIVITY.map((a) => (
          <li key={a.id} className="flex items-start gap-3 px-4 py-3">
            <Clock className="mt-0.5 size-3.5 shrink-0 text-muted-foreground/40" />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-foreground leading-snug">{a.message}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {a.actor} · {new Date(a.timestamp).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
