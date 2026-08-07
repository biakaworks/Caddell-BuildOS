"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, AlertTriangle, Package, Calendar, FileText, Clock } from "lucide-react"
import { FAB_ITEMS, INSTALL_EVENTS, DOCUMENTS, ACTIVITY, formatCurrency } from "@/lib/data/fixtures"
import { PageContainer, PageHeader, StatusPill, SectionHeading, healthTone, statusToTone, Meter, PhaseTrack, StatTile } from "./ui"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Project } from "@/lib/types"
import { cn } from "@/lib/utils"
import { FAB_STAGES } from "@/lib/types"

const SYSTEM_STATUS_CLASS: Record<string, string> = {
  "Not Started": "text-muted-foreground",
  "In Progress": "text-warning",
  "Complete":    "text-success",
  "On Hold":     "text-danger",
}

export function ProjectDetail({ project }: { project: Project }) {
  const [tab, setTab] = useState("overview")

  const fabItems   = FAB_ITEMS.filter((f) => f.projectId === project.id)
  const installs   = INSTALL_EVENTS.filter((e) => e.projectId === project.id)
  const docs       = DOCUMENTS.filter((d) => d.projectId === project.id)
  const activity   = ACTIVITY.filter((a) => a.projectId === project.id)
  const blocked    = fabItems.filter((f) => f.blocked)

  const docCounts = docs.reduce(
    (acc, d) => ({ ...acc, [d.approvalState]: (acc[d.approvalState as keyof typeof acc] ?? 0) + 1 }),
    {} as Record<string, number>
  )
  const openDocs = (docCounts["Submitted"] ?? 0) + (docCounts["Awaiting Architect Approval"] ?? 0) + (docCounts["Revise & Resubmit"] ?? 0)

  return (
    <PageContainer>
      <Link
        href="/projects"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        All projects
      </Link>

      <header className="mt-3 border-b border-border pb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <StatusPill tone={healthTone(project.healthStatus)}>{project.healthStatus}</StatusPill>
              <span data-pill className="rounded-full border border-border px-2.5 py-0.5 text-[11px] text-muted-foreground">
                {project.sector}
              </span>
              <span data-pill className="rounded-full border border-border px-2.5 py-0.5 text-[11px] text-muted-foreground">
                {project.state}
              </span>
            </div>
            <h1
              className="text-2xl text-foreground text-balance"
              style={{ letterSpacing: "-0.03em" }}
            >
              {project.name}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {project.city}, {project.state} &middot; GC: {project.gc}
            </p>
            {project.healthStatus !== "On Schedule" && project.atRiskReason && (
              <p className="mt-2 flex items-center gap-2 text-sm text-warning">
                <AlertTriangle className="size-4 shrink-0" />
                {project.atRiskReason}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-[11px] text-muted-foreground mb-1">Contract Value</p>
            <p className="text-2xl text-foreground tabular-nums" style={{ letterSpacing: "-0.03em" }}>
              {formatCurrency(project.contractValue, false)}
            </p>
          </div>
        </div>

        {/* Phase track */}
        <div className="mt-5 overflow-x-auto">
          <PhaseTrack current={project.phase} />
        </div>
      </header>

      {/* KPI strip */}
      <div className="mt-5 grid grid-cols-2 gap-px bg-border lg:grid-cols-4">
        <StatTile
          label="Phase"
          value={project.phase}
          tone="neutral"
        />
        <StatTile
          label="Complete"
          value={`${project.percentComplete}%`}
          tone={healthTone(project.healthStatus)}
          sub={project.percentComplete >= 90 ? "Near completion" : undefined}
        />
        <StatTile
          label="Install Window"
          value={new Date(project.installWindowStart).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
          sub={
            project.hardDeadlineWindow
              ? `Hard deadline: ${project.hardDeadlineWindow}`
              : `Ends ${new Date(project.installWindowEnd).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
          }
          tone={project.hardDeadlineWindow ? "warning" : "neutral"}
        />
        <StatTile
          label="Blocked Items"
          value={blocked.length}
          tone={blocked.length > 0 ? "danger" : "success"}
          sub={blocked.length > 0 ? "Fabrication blocked" : "Fabrication clear"}
        />
      </div>

      <Tabs value={tab} onValueChange={setTab} className="mt-6">
        <TabsList className="h-auto bg-muted/60 p-0 flex justify-start border-b border-border">
          <TabsTrigger value="overview"  className="px-4 py-2.5 text-sm data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent">Overview</TabsTrigger>
          <TabsTrigger value="fabrication" className="px-4 py-2.5 text-sm data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent">
            Fabrication
            {blocked.length > 0 && (
              <span className="ml-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger-muted px-1 text-[10px] text-danger tabular-nums">
                {blocked.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="schedule" className="px-4 py-2.5 text-sm data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent">Install</TabsTrigger>
          <TabsTrigger value="documents" className="px-4 py-2.5 text-sm data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent">
            Documents
            {openDocs > 0 && (
              <span className="ml-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-info-muted px-1 text-[10px] text-info tabular-nums">
                {openDocs}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="activity" className="px-4 py-2.5 text-sm data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-5">
          <OverviewTab project={project} />
        </TabsContent>
        <TabsContent value="fabrication" className="mt-5">
          <FabricationTab items={fabItems} />
        </TabsContent>
        <TabsContent value="schedule" className="mt-5">
          <InstallTab events={installs} />
        </TabsContent>
        <TabsContent value="documents" className="mt-5">
          <DocumentsTab docs={docs} />
        </TabsContent>
        <TabsContent value="activity" className="mt-5">
          <ActivityTab events={activity} />
        </TabsContent>
      </Tabs>
    </PageContainer>
  )
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────
function OverviewTab({ project }: { project: Project }) {
  const totalLites = project.systems.reduce((sum, s) => sum + s.liteCount, 0)

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-5">
        {/* Systems breakdown */}
        <div className="border border-border bg-card">
          <div className="border-b border-border px-4 py-3">
            <SectionHeading title="Systems Scope" description={`${totalLites} total lites · ${project.systems.length} system type${project.systems.length > 1 ? "s" : ""}`} />
          </div>
          <div className="divide-y divide-border">
            {project.systems.map((sys) => (
              <div key={sys.type} className="flex items-start gap-4 px-4 py-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <p className="text-sm text-foreground">{sys.type}</p>
                    <span className={cn("text-[11px]", SYSTEM_STATUS_CLASS[sys.status])}>
                      {sys.status}
                    </span>
                  </div>
                  {sys.notes && (
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{sys.notes}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm tabular-nums text-foreground">{sys.liteCount}</p>
                  <p className="text-[10px] text-muted-foreground">lites</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Completion meter */}
        <div className="border border-border bg-card px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <SectionHeading title="Overall Completion" />
            <span className="text-sm tabular-nums text-foreground">{project.percentComplete}%</span>
          </div>
          <Meter value={project.percentComplete} tone={healthTone(project.healthStatus)} className="h-2" />
        </div>
      </div>

      {/* Right panel */}
      <div className="space-y-4">
        {/* Job summary */}
        <div className="border border-border bg-card divide-y divide-border">
          {[
            { label: "GC",           value: project.gc },
            { label: "Sector",       value: project.sector },
            { label: "City / State", value: `${project.city}, ${project.state}` },
            { label: "Install Start", value: new Date(project.installWindowStart).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) },
            { label: "Install End",   value: new Date(project.installWindowEnd).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) },
            ...(project.hardDeadlineWindow ? [{ label: "Hard Deadline", value: project.hardDeadlineWindow }] : []),
            { label: "Contract",     value: formatCurrency(project.contractValue, false) },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between px-4 py-2.5">
              <span className="text-[11px] text-muted-foreground">{label}</span>
              <span className="text-[12px] text-foreground text-right max-w-[180px]">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Fabrication Tab ──────────────────────────────────────────────────────────
function FabricationTab({ items }: { items: ReturnType<typeof FAB_ITEMS.filter> }) {
  if (items.length === 0) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center text-sm text-muted-foreground">
        No fabrication items tracked yet for this project.
      </div>
    )
  }

  // Group by stage
  const byStage: Record<string, typeof items> = {}
  FAB_STAGES.forEach((s) => { byStage[s] = [] })
  items.forEach((item) => byStage[item.stage]?.push(item))

  return (
    <div className="space-y-4">
      {/* Blocked items at top */}
      {items.filter((i) => i.blocked).map((item) => (
        <div
          key={item.id}
          className="flex items-start gap-3 border border-danger/30 bg-danger-muted px-4 py-3"
        >
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-danger" />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-foreground">{item.description}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{item.system} · {item.liteCount} lites</p>
            {item.blockReason && (
              <p className="mt-1 text-xs text-danger">{item.blockReason}</p>
            )}
          </div>
          <div className="shrink-0 text-right">
            <StatusPill tone="danger">Blocked</StatusPill>
            <p className="mt-1 text-[10px] text-muted-foreground">Due {new Date(item.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
          </div>
        </div>
      ))}

      {/* Stage columns for non-blocked */}
      <div className="grid gap-px bg-border sm:grid-cols-3 lg:grid-cols-6">
        {FAB_STAGES.map((stage) => {
          const stageItems = byStage[stage]?.filter((i) => !i.blocked) ?? []
          return (
            <div key={stage} className="bg-card">
              <div className="border-b border-border px-3 py-2">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider">{stage}</p>
                <p className="text-lg tabular-nums text-foreground" style={{ letterSpacing: "-0.02em" }}>{stageItems.length}</p>
              </div>
              <div className="p-2 space-y-1.5">
                {stageItems.map((item) => (
                  <div key={item.id} className="border border-border bg-background px-2 py-2">
                    <p className="text-[11px] text-foreground leading-snug">{item.description}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{item.liteCount} lites</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                      Due {new Date(item.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                ))}
                {stageItems.length === 0 && (
                  <p className="text-[10px] text-muted-foreground/40 px-1 py-2">—</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Install Tab ──────────────────────────────────────────────────────────────
function InstallTab({ events }: { events: ReturnType<typeof INSTALL_EVENTS.filter> }) {
  if (events.length === 0) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center text-sm text-muted-foreground">
        No install events scheduled yet for this project.
      </div>
    )
  }

  return (
    <div className="border border-border bg-card divide-y divide-border">
      {events.map((evt) => (
        <div key={evt.id} className="flex items-center gap-4 px-4 py-3">
          <Calendar className="size-4 shrink-0 text-muted-foreground/50" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground">{evt.crew}</p>
            <p className="text-[11px] text-muted-foreground">{evt.city}, {evt.state}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-foreground">
              {new Date(evt.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              {" – "}
              {new Date(evt.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
            {evt.conflictWith && (
              <p className="text-[11px] text-warning mt-0.5 flex items-center gap-1 justify-end">
                <AlertTriangle className="size-3" /> Crew conflict
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Documents Tab ────────────────────────────────────────────────────────────
function DocumentsTab({ docs }: { docs: ReturnType<typeof DOCUMENTS.filter> }) {
  if (docs.length === 0) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center text-sm text-muted-foreground">
        No documents tracked yet for this project.
      </div>
    )
  }

  return (
    <div className="border border-border bg-card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {["Document", "Type", "Rev", "Status", "Updated"].map((c) => (
              <th key={c} className="px-4 py-2.5 text-left text-[11px] font-normal text-muted-foreground uppercase tracking-wider">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {docs.map((doc) => (
            <tr key={doc.id} className="hover:bg-muted/30 transition-colors">
              <td className="px-4 py-3">
                <p className="text-foreground">{doc.name}</p>
              </td>
              <td className="px-4 py-3 text-muted-foreground text-xs">{doc.type}</td>
              <td className="px-4 py-3 text-muted-foreground text-xs tabular-nums">{doc.revision}</td>
              <td className="px-4 py-3">
                <StatusPill tone={statusToTone(doc.approvalState)}>{doc.approvalState}</StatusPill>
              </td>
              <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                {new Date(doc.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Activity Tab ─────────────────────────────────────────────────────────────
function ActivityTab({ events }: { events: ReturnType<typeof ACTIVITY.filter> }) {
  if (events.length === 0) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center text-sm text-muted-foreground">
        No activity logged yet for this project.
      </div>
    )
  }

  return (
    <div className="border border-border bg-card divide-y divide-border">
      {events.map((evt) => (
        <div key={evt.id} className="flex items-start gap-3 px-4 py-3">
          <Clock className="mt-0.5 size-3.5 shrink-0 text-muted-foreground/40" />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-foreground">{evt.message}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {evt.actor} &middot;{" "}
              {new Date(evt.timestamp).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
