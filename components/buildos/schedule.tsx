"use client"

import Link from "next/link"
import { AlertTriangle } from "lucide-react"
import { INSTALL_EVENTS, PROJECTS } from "@/lib/data/fixtures"
import { fmtDate } from "@/lib/format"
import { PageContainer, PageHeader, StatusPill, StatTile, SectionHeading } from "./ui"
import { cn } from "@/lib/utils"

const CREW_COLOR: Record<string, string> = {
  "Crew A": "bg-primary/20 border-primary/40 text-primary",
  "Crew B": "bg-success-muted border-success/30 text-success-strong",
  "Crew C": "bg-warning-muted border-warning/30 text-warning-strong",
}

function projectName(id: string) {
  return PROJECTS.find((p) => p.id === id)?.name ?? id
}

// Generate a list of months in the schedule. Built entirely in UTC so the month
// axis is identical on server and client regardless of local timezone.
function getMonths(): { label: string; start: Date; end: Date }[] {
  // Aug 2026 – Aug 2027 (month index 7 = August)
  const months: { label: string; start: Date; end: Date }[] = []
  for (let i = 0; i < 13; i++) {
    const d = new Date(Date.UTC(2026, 7 + i, 1))
    const end = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0))
    months.push({
      label: fmtDate(d, { month: "short", year: "2-digit" }),
      start: d,
      end,
    })
  }
  return months
}

export function InstallSchedule() {
  const crews = ["Crew A", "Crew B", "Crew C"] as const
  const conflicts = INSTALL_EVENTS.filter((e) => e.conflictWith)
  const months = getMonths()

  // Build Gantt rows per crew
  const TOTAL_START = new Date("2026-08-01")
  const TOTAL_END   = new Date("2027-09-01")
  const TOTAL_MS    = TOTAL_END.getTime() - TOTAL_START.getTime()

  function pct(d: Date) {
    return ((d.getTime() - TOTAL_START.getTime()) / TOTAL_MS) * 100
  }

  return (
    <PageContainer>
      <PageHeader
        title="Install Schedule"
        subtitle="Crew deployment calendar · Aug 2026 – Aug 2027"
      />

      {/* KPI strip */}
      <div className="mt-5 grid grid-cols-2 gap-px bg-border sm:grid-cols-4">
        <StatTile label="Install Events"   value={INSTALL_EVENTS.length}   tone="neutral" />
        <StatTile label="Crew Conflicts"   value={conflicts.length / 2}    tone={conflicts.length > 0 ? "warning" : "success"}
                  sub={conflicts.length > 0 ? "Needs resolution" : "All clear"} />
        <StatTile label="Active This Week" value={
          INSTALL_EVENTS.filter((e) =>
            new Date(e.startDate) <= new Date("2026-08-14") &&
            new Date(e.endDate) >= new Date("2026-08-07")
          ).length
        } tone="info" />
        <StatTile label="Crews Deployed"   value={3} tone="neutral" />
      </div>

      {/* Conflict callout */}
      {conflicts.length > 0 && (
        <div className="mt-5 flex items-start gap-3 border border-warning/30 bg-warning-muted px-4 py-3">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
          <p className="text-sm text-foreground">
            <span className="text-warning font-medium">{conflicts.length / 2} crew {conflicts.length / 2 === 1 ? "conflict" : "conflicts"} detected.</span>{" "}
            Crew B has overlapping jobs in Joplin — Menards and Millennium Fitness windows overlap by 5 days.{" "}
            Review and reassign or compress the schedule.
          </p>
        </div>
      )}

      {/* Gantt chart */}
      <div className="mt-6 border border-border bg-card overflow-x-auto">
        <div className="border-b border-border px-4 py-3">
          <SectionHeading title="Crew Gantt" description="Click a project link to open the project detail" />
        </div>

        {/* Month headers */}
        <div className="min-w-[900px]">
          <div className="flex border-b border-border">
            <div className="w-32 shrink-0 border-r border-border px-3 py-2">
              <span className="text-[10px] text-muted-foreground">Crew</span>
            </div>
            <div className="relative flex-1 flex">
              {months.map((m) => (
                <div
                  key={m.label}
                  className="flex-1 px-2 py-2 border-r border-border/40 last:border-r-0"
                  style={{ minWidth: "60px" }}
                >
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">{m.label}</span>
                </div>
              ))}
            </div>
          </div>

          {crews.map((crew) => {
            const events = INSTALL_EVENTS.filter((e) => e.crew === crew)
            return (
              <div key={crew} className="flex border-b border-border/50 last:border-b-0 min-h-[64px]">
                <div className="w-32 shrink-0 border-r border-border px-3 py-3">
                  <p className="text-xs text-foreground">{crew}</p>
                </div>
                <div className="relative flex-1 py-3">
                  {/* Month grid lines */}
                  <div className="absolute inset-0 flex pointer-events-none">
                    {months.map((m) => (
                      <div key={m.label} className="flex-1 border-r border-border/20 last:border-r-0" />
                    ))}
                  </div>

                  {/* Event bars */}
                  {events.map((evt, idx) => {
                    const left = Math.max(0, pct(new Date(evt.startDate)))
                    const right = Math.min(100, pct(new Date(evt.endDate)))
                    const width = right - left
                    const hasConflict = !!evt.conflictWith
                    const top = (idx % 2) * 28 + 2
                    return (
                      <div
                        key={evt.id}
                        className={cn(
                          "absolute h-6 flex items-center px-2 border text-[10px] overflow-hidden whitespace-nowrap",
                          hasConflict
                            ? "border-warning/50 bg-warning-muted text-warning-strong"
                            : CREW_COLOR[crew],
                        )}
                        style={{
                          left: `${left}%`,
                          width: `${Math.max(width, 2)}%`,
                          top: `${top}px`,
                        }}
                        title={`${projectName(evt.projectId)} — ${evt.city}, ${evt.state}`}
                      >
                        <Link href={`/projects/${evt.projectId}`} className="truncate hover:underline">
                          {projectName(evt.projectId)}
                        </Link>
                        {hasConflict && <AlertTriangle className="ml-1 size-3 shrink-0" />}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Events table */}
      <div className="mt-8 border border-border bg-card overflow-x-auto">
        <div className="border-b border-border px-4 py-3">
          <SectionHeading title="All Install Events" />
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {["Project", "Crew", "City", "State", "Start", "End", "Status"].map((c) => (
                <th key={c} className="px-4 py-2.5 text-left text-[11px] font-normal text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {[...INSTALL_EVENTS]
              .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
              .map((evt) => (
                <tr key={evt.id} className={cn("hover:bg-muted/30 transition-colors", evt.conflictWith && "bg-warning-muted/20")}>
                  <td className="px-4 py-3">
                    <Link href={`/projects/${evt.projectId}`} className="text-foreground hover:text-primary">
                      {projectName(evt.projectId)}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("px-2 py-0.5 text-[11px] border", CREW_COLOR[evt.crew])}>
                      {evt.crew}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{evt.city}</td>
                  <td className="px-4 py-3 text-muted-foreground">{evt.state}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {fmtDate(evt.startDate, { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {fmtDate(evt.endDate, { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3">
                    {evt.conflictWith ? (
                      <StatusPill tone="warning">Conflict</StatusPill>
                    ) : (
                      <StatusPill tone="success">Scheduled</StatusPill>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </PageContainer>
  )
}
