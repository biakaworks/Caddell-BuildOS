"use client"

import Link from "next/link"
import { AlertTriangle, TrendingUp, Package, CalendarRange, ClipboardList, Zap } from "lucide-react"
import { PROJECTS, FAB_ITEMS, INSTALL_EVENTS, BIDS, OPPORTUNITIES, TICKETS, formatCurrency } from "@/lib/data/fixtures"
import { PageContainer, StatusPill, healthTone, Meter, StatTile, SectionHeading, TrendDelta } from "./ui"
import { cn } from "@/lib/utils"

export function Dashboard() {
  // ── Derived KPIs ──────────────────────────────────────────────────────────
  const atRisk    = PROJECTS.filter((p) => p.healthStatus === "At Risk").length
  const late      = PROJECTS.filter((p) => p.healthStatus === "Late").length
  const activeJobs= PROJECTS.filter((p) => !["Estimate"].includes(p.phase)).length
  const totalCV   = PROJECTS.reduce((s, p) => s + p.contractValue, 0)
  const blocked   = FAB_ITEMS.filter((i) => i.blocked)
  const openTickets = TICKETS.filter((t) => t.status !== "Resolved").length
  const crewConflicts = INSTALL_EVENTS.filter((e) => e.conflictWith).length / 2

  // Summer shutdown jobs — hard-deadline constraint
  const summerJobs = PROJECTS.filter((p) => p.hardDeadlineWindow)

  // Bids due within 7 days (relative to demo date 2026-08-07)
  const demoNow = new Date("2026-08-07")
  const bidsUrgent = BIDS.filter((b) => {
    const due = new Date(b.bidDueDate)
    return due >= demoNow && due <= new Date(demoNow.getTime() + 7 * 86_400_000)
  })

  const openPipeline = OPPORTUNITIES
    .filter((o) => !["Won","Lost"].includes(o.stage))
    .reduce((s, o) => s + o.value, 0)

  return (
    <PageContainer>
      {/* ── Header ── */}
      <header className="border-b border-border pb-6">
        <p className="text-overline text-muted-foreground/50 mb-1">Commercial Glass &amp; Metal</p>
        <h1 className="text-3xl text-foreground" style={{ letterSpacing: "-0.03em" }}>
          Pulse Dashboard
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {new Date("2026-08-07").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          <span className="mx-2 text-muted-foreground/30">·</span>
          {activeJobs} active jobs · {formatCurrency(totalCV)} portfolio
        </p>
      </header>

      {/* ── Alerts strip ── */}
      {(atRisk + late + blocked.length + openTickets + crewConflicts > 0) && (
        <section className="mt-5 space-y-2" aria-label="Active alerts">
          {late > 0 && (
            <Alert tone="danger">
              <AlertTriangle className="size-4 shrink-0" />
              <span><strong className="text-danger-strong">{late} job{late > 1 ? "s" : ""}</strong> are past their install window.</span>
            </Alert>
          )}
          {atRisk > 0 && (
            <Alert tone="warning">
              <AlertTriangle className="size-4 shrink-0" />
              <span><strong>{atRisk} job{atRisk > 1 ? "s" : ""} at risk</strong> — fabrication or vendor delays.</span>
            </Alert>
          )}
          {blocked.length > 0 && (
            <Alert tone="danger">
              <Package className="size-4 shrink-0" />
              <span>
                <strong className="text-danger-strong">{blocked.length} fab item{blocked.length > 1 ? "s" : ""} blocked</strong>
                {" — "}{blocked.map((b) => b.blockReason).filter(Boolean).slice(0, 1).join(", ")}.{" "}
                <Link href="/fabrication" className="underline underline-offset-2 text-danger-strong hover:text-danger">View fabrication</Link>
              </span>
            </Alert>
          )}
          {crewConflicts > 0 && (
            <Alert tone="warning">
              <CalendarRange className="size-4 shrink-0" />
              <span>
                <strong>{crewConflicts} crew scheduling conflict{crewConflicts > 1 ? "s" : ""}</strong> detected.{" "}
                <Link href="/schedule" className="underline underline-offset-2 text-warning hover:text-warning-strong">Review schedule</Link>
              </span>
            </Alert>
          )}
          {openTickets > 0 && (
            <Alert tone="warning">
              <Zap className="size-4 shrink-0" />
              <span>
                <strong>{openTickets} emergency dispatch {openTickets > 1 ? "tickets" : "ticket"}</strong> open.{" "}
                <Link href="/dispatch" className="underline underline-offset-2 text-warning hover:text-warning-strong">View dispatch</Link>
              </span>
            </Alert>
          )}
        </section>
      )}

      {/* ── Top KPIs ── */}
      <section className="mt-6 grid grid-cols-2 gap-px bg-border sm:grid-cols-3 lg:grid-cols-6" aria-label="Key metrics">
        <StatTile label="Active Jobs"     value={activeJobs}            tone="neutral" />
        <StatTile label="At Risk / Late"  value={`${atRisk + late}`}    tone={atRisk + late > 0 ? "danger" : "success"}
                  sub={atRisk + late > 0 ? "Needs attention" : "All on schedule"} />
        <StatTile label="Fab Blocked"     value={blocked.length}        tone={blocked.length > 0 ? "danger" : "success"}
                  sub={blocked.length > 0 ? "Action required" : "Shop clear"} />
        <StatTile label="Crew Conflicts"  value={crewConflicts}         tone={crewConflicts > 0 ? "warning" : "success"} />
        <StatTile label="Open Bids"       value={BIDS.filter((b) => !["Awarded","Lost"].includes(b.status)).length} tone="info" />
        <StatTile label="Pipeline"        value={formatCurrency(openPipeline)} tone="info" />
      </section>

      {/* ── Main grid ── */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">

        {/* Left column */}
        <div className="space-y-6">

          {/* Summer deadline watch */}
          {summerJobs.length > 0 && (
            <section className="border border-warning/30 bg-warning-muted">
              <div className="flex items-center gap-2 border-b border-warning/20 px-4 py-3">
                <CalendarRange className="size-4 text-warning" />
                <SectionHeading title={`Summer Shutdown Watch — ${summerJobs.length} jobs`} />
              </div>
              <div className="divide-y divide-warning/10">
                {summerJobs.map((p) => (
                  <Link
                    key={p.id}
                    href={`/projects/${p.id}`}
                    className="flex items-start gap-4 px-4 py-3 hover:bg-warning/5 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-foreground">{p.name}</p>
                        <StatusPill tone={healthTone(p.healthStatus)} className="text-[10px]">
                          {p.healthStatus}
                        </StatusPill>
                      </div>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">{p.city}, {p.state} · {p.hardDeadlineWindow}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs tabular-nums text-foreground">
                        {new Date(p.installWindowStart).toLocaleDateString("en-US", { month: "short", day: "numeric" })}–
                        {new Date(p.installWindowEnd).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                      <div className="mt-1">
                        <Meter value={p.percentComplete} tone={healthTone(p.healthStatus)} className="w-24" />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5 tabular-nums">{p.percentComplete}%</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* At-risk jobs */}
          <section className="border border-border bg-card">
            <div className="border-b border-border px-4 py-3 flex items-center justify-between">
              <SectionHeading title="Jobs Needing Attention" description="At risk and late, sorted by health" />
              <Link href="/projects" className="text-xs text-primary hover:underline">All projects</Link>
            </div>
            <div className="divide-y divide-border">
              {PROJECTS
                .filter((p) => p.healthStatus !== "On Schedule")
                .concat(PROJECTS.filter((p) => p.healthStatus === "On Schedule").slice(0, 3))
                .slice(0, 8)
                .map((p) => (
                  <Link
                    key={p.id}
                    href={`/projects/${p.id}`}
                    className="flex items-center gap-4 px-4 py-3 hover:bg-muted/20 transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-foreground group-hover:text-primary">{p.name}</p>
                        <StatusPill tone={healthTone(p.healthStatus)} className="text-[10px]">
                          {p.healthStatus}
                        </StatusPill>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{p.phase} · {p.city}, {p.state}</p>
                      {p.atRiskReason && (
                        <p className="text-[11px] text-warning mt-0.5">{p.atRiskReason}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs tabular-nums text-muted-foreground">{formatCurrency(p.contractValue)}</p>
                      <div className="mt-1 w-20">
                        <Meter value={p.percentComplete} tone={healthTone(p.healthStatus)} />
                        <p className="text-[10px] text-muted-foreground mt-0.5 tabular-nums">{p.percentComplete}%</p>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          </section>

          {/* Fabrication blocked */}
          {blocked.length > 0 && (
            <section className="border border-danger/30 bg-danger-muted">
              <div className="border-b border-danger/20 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="size-4 text-danger" />
                  <SectionHeading title={`${blocked.length} Blocked Fab Items`} />
                </div>
                <Link href="/fabrication" className="text-xs text-danger hover:underline">View all</Link>
              </div>
              <div className="divide-y divide-danger/10">
                {blocked.map((item) => (
                  <div key={item.id} className="px-4 py-3">
                    <p className="text-sm text-foreground">{item.description}</p>
                    <p className="text-[11px] text-muted-foreground">{item.system} · {item.liteCount} lites</p>
                    {item.blockReason && (
                      <p className="mt-0.5 text-xs text-danger">{item.blockReason}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-5">

          {/* Bids due this week */}
          <section className="border border-border bg-card">
            <div className="border-b border-border px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardList className="size-4 text-muted-foreground/50" />
                <SectionHeading title="Bids Due This Week" />
              </div>
              <Link href="/bids" className="text-xs text-primary hover:underline">All bids</Link>
            </div>
            {bidsUrgent.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">No bids due in next 7 days.</div>
            ) : (
              <div className="divide-y divide-border">
                {bidsUrgent.map((bid) => (
                  <Link
                    key={bid.ref}
                    href={`/bids/${bid.ref}`}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">{bid.projectName}</p>
                      <p className="text-[11px] text-muted-foreground">{bid.gc} · {bid.estimator}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs tabular-nums text-warning">
                        {new Date(bid.bidDueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{bid.estimatedHours}h est.</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Pipeline snapshot */}
          <section className="border border-border bg-card">
            <div className="border-b border-border px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="size-4 text-muted-foreground/50" />
                <SectionHeading title="Pipeline Snapshot" />
              </div>
              <Link href="/pipeline" className="text-xs text-primary hover:underline">Open board</Link>
            </div>
            <div className="divide-y divide-border">
              {(["Lead","Qualified","Bidding","Proposal Out"] as const).map((stage) => {
                const items = OPPORTUNITIES.filter((o) => o.stage === stage)
                const val = items.reduce((s, o) => s + o.value, 0)
                return (
                  <div key={stage} className="flex items-center justify-between px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{stage}</span>
                      <span className="text-[10px] text-muted-foreground/50">{items.length}</span>
                    </div>
                    <span className="text-xs tabular-nums text-foreground">{formatCurrency(val)}</span>
                  </div>
                )
              })}
              <div className="flex items-center justify-between px-4 py-2.5 bg-muted/20">
                <span className="text-xs font-medium text-foreground">Total Open</span>
                <span className="text-xs tabular-nums text-foreground">{formatCurrency(openPipeline)}</span>
              </div>
            </div>
          </section>

          {/* Emergency dispatch status */}
          <section className="border border-border bg-card">
            <div className="border-b border-border px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="size-4 text-muted-foreground/50" />
                <SectionHeading title="Emergency Dispatch" />
              </div>
              <Link href="/dispatch" className="text-xs text-primary hover:underline">All tickets</Link>
            </div>
            <div className="divide-y divide-border">
              {TICKETS.filter((t) => t.status !== "Resolved").slice(0, 4).map((t) => (
                <div key={t.id} className="flex items-start gap-3 px-4 py-3">
                  <span className={cn(
                    "mt-1.5 size-2 rounded-full shrink-0",
                    t.status === "New" ? "bg-danger animate-pulse" : "bg-warning"
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground truncate">{t.location}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{t.opening}</p>
                  </div>
                  <StatusPill tone={t.status === "New" ? "danger" : "warning"} className="text-[10px] shrink-0">
                    {t.status}
                  </StatusPill>
                </div>
              ))}
              {TICKETS.filter((t) => t.status !== "Resolved").length === 0 && (
                <div className="px-4 py-5 text-center text-sm text-success">
                  No open service calls.
                </div>
              )}
            </div>
          </section>

        </div>
      </div>
    </PageContainer>
  )
}

function Alert({
  tone,
  children,
}: {
  tone: "danger" | "warning"
  children: React.ReactNode
}) {
  const styles = {
    danger:  "border-danger/30 bg-danger-muted text-danger-strong",
    warning: "border-warning/30 bg-warning-muted text-warning-strong",
  }
  return (
    <div className={cn("flex items-start gap-2.5 border px-4 py-3 text-sm", styles[tone])}>
      {children}
    </div>
  )
}
