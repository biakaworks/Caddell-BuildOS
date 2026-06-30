"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, CloudSun, Hammer, Sparkles, Users } from "lucide-react"
import {
  formatCurrency,
  type FieldReport,
  type Health,
  type Project,
  type ScheduleMilestone,
} from "@/lib/mock-data"
import { useApp } from "@/components/buildos/app-context"
import {
  HealthDot,
  Meter,
  PageContainer,
  StatusPill,
  statusToTone,
} from "@/components/buildos/ui"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { PhaseBadge } from "@/components/buildos/phase"
import { RiskAnalyticsTab, RealityCaptureTab, MobileFieldPreview } from "@/components/buildos/project-extras"

const healthLabel: Record<Health, string> = {
  "on-track": "On track",
  "at-risk": "At risk",
  critical: "Critical",
}

const TABS = [
  { value: "overview", label: "Overview" },
  { value: "schedule", label: "Schedule" },
  { value: "cost", label: "Cost" },
  { value: "rfis", label: "RFIs" },
  { value: "submittals", label: "Submittals" },
  { value: "field", label: "Field" },
  { value: "risk", label: "Risk", phase: 2 },
  { value: "capture", label: "Reality Capture", phase: 3 },
] as const

export function ProjectDetail({ project, initialTab }: { project: Project; initialTab?: string }) {
  const { openAsk } = useApp()
  const [tab, setTab] = useState(
    TABS.some((t) => t.value === initialTab) ? (initialTab as string) : "overview",
  )

  const openRfis = project.rfis.filter((r) => r.status !== "Answered").length
  const openSubs = project.submittals.filter((s) => s.status !== "Approved").length

  return (
    <PageContainer>
      <Link
        href="/projects"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        All projects
      </Link>

      <header className="mt-3 flex flex-col gap-4 border-b border-border pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">
              {project.unit}
            </span>
            <span className="text-xs text-muted-foreground">
              {project.delivery} · {project.market}
            </span>
          </div>
          <h1 className="mt-2 font-heading text-2xl font-semibold tracking-tight text-foreground text-balance">
            {project.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            {project.location} · PM {project.pm} · {project.startDate} – {project.finishDate}
          </p>
        </div>
        <Button
          onClick={() =>
            openAsk(`Summarize schedule and cost risk for ${project.name} and recommend recovery actions.`)
          }
        >
          <Sparkles className="size-4" />
          Ask about this project
        </Button>
      </header>

      {/* KPI strip */}
      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Contract value" value={formatCurrency(project.contractValue)} />
        <StatTile
          label="Complete"
          value={`${project.percentComplete}%`}
          meter={{ value: project.percentComplete, tone: "info" }}
        />
        <StatTile
          label="Schedule health"
          value={healthLabel[project.scheduleHealth]}
          health={project.scheduleHealth}
        />
        <StatTile
          label="Budget variance"
          value={`${project.budgetVariancePct > 0 ? "+" : ""}${project.budgetVariancePct}%`}
          tone={project.budgetVariancePct > 2 ? "warn" : project.budgetVariancePct < 0 ? "good" : "neutral"}
        />
      </div>

      <Tabs value={tab} onValueChange={setTab} className="mt-6 gap-5">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-muted/60 p-1">
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value} className="data-[state=active]:bg-card">
              {t.label}
              {t.value === "rfis" && openRfis > 0 ? <Count n={openRfis} /> : null}
              {t.value === "submittals" && openSubs > 0 ? <Count n={openSubs} /> : null}
              {"phase" in t && t.phase ? <PhaseBadge phase={t.phase} className="ml-1.5" /> : null}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab project={project} />
        </TabsContent>
        <TabsContent value="schedule">
          <ScheduleTab project={project} />
        </TabsContent>
        <TabsContent value="cost">
          <CostTab project={project} />
        </TabsContent>
        <TabsContent value="rfis">
          <LogTable
            columns={["RFI", "Subject", "Status", "Owner", "Due"]}
            rows={project.rfis.map((r) => [r.id, r.subject, r.status, r.owner, r.due])}
          />
        </TabsContent>
        <TabsContent value="submittals">
          <LogTable
            columns={["No.", "Item", "Status", "Reviewer", "Due"]}
            rows={project.submittals.map((s) => [s.id, s.item, s.status, s.reviewer, s.due])}
          />
        </TabsContent>
        <TabsContent value="field">
          <FieldTab project={project} />
        </TabsContent>
      </Tabs>
    </PageContainer>
  )
}

function Count({ n }: { n: number }) {
  return (
    <span className="ml-1.5 rounded-full bg-danger px-1.5 text-xs font-semibold text-danger-foreground tabular-nums">
      {n}
    </span>
  )
}

function StatTile({
  label,
  value,
  meter,
  health,
  tone = "neutral",
}: {
  label: string
  value: string
  meter?: { value: number; tone: "info" | "success" | "warning" | "danger" | "neutral" }
  health?: Health
  tone?: "neutral" | "good" | "warn"
}) {
  return (
    <div className="rounded-xl bg-card p-4 ring-1 ring-border">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-1 flex items-center gap-1.5 text-lg font-semibold tracking-tight tabular-nums",
          tone === "warn" && "text-warning-strong",
          tone === "good" && "text-success-strong",
        )}
      >
        {health ? <HealthDot health={health} /> : null}
        {value}
      </p>
      {meter ? <Meter className="mt-2" value={meter.value} tone={meter.tone} /> : null}
    </div>
  )
}

function OverviewTab({ project }: { project: Project }) {
  const criticalMilestone = project.milestones.find((m) => m.status === "in-progress") ?? project.milestones[0]
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-4">
        <div className="rounded-2xl bg-card p-5 ring-1 ring-border">
          <h3 className="text-sm font-semibold text-foreground">Status narrative</h3>
          <p className="mt-2 text-sm leading-relaxed text-foreground/90">{project.scheduleNote}</p>
        </div>
        <div className="rounded-2xl bg-card p-5 ring-1 ring-border">
          <h3 className="text-sm font-semibold text-foreground">Next critical milestone</h3>
          <div className="mt-3 flex items-center justify-between rounded-xl bg-muted/60 px-4 py-3">
            <div className="flex items-center gap-2">
              <HealthDot health={criticalMilestone.health} />
              <div>
                <p className="text-sm font-medium text-foreground">{criticalMilestone.name}</p>
                <p className="text-xs text-muted-foreground">Target {criticalMilestone.date}</p>
              </div>
            </div>
            <span className="text-xs font-medium text-muted-foreground capitalize">{criticalMilestone.status}</span>
          </div>
        </div>
      </div>
      <div className="rounded-2xl bg-card p-5 ring-1 ring-border">
        <h3 className="text-sm font-semibold text-foreground">Open items</h3>
        <ul className="mt-3 space-y-3 text-sm">
          <OpenItem label="Open RFIs" value={project.rfis.filter((r) => r.status !== "Answered").length} />
          <OpenItem label="Overdue RFIs" value={project.rfis.filter((r) => r.overdue).length} danger />
          <OpenItem label="Open submittals" value={project.submittals.filter((s) => s.status !== "Approved").length} />
          <OpenItem label="Overdue submittals" value={project.submittals.filter((s) => s.overdue).length} danger />
        </ul>
      </div>
    </div>
  )
}

function OpenItem({ label, value, danger }: { label: string; value: number; danger?: boolean }) {
  return (
    <li className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={cn(
          "rounded-md px-2 py-0.5 text-sm font-semibold tabular-nums",
          danger && value > 0 ? "bg-danger-muted text-danger-strong" : "bg-muted text-foreground",
        )}
      >
        {value}
      </span>
    </li>
  )
}

function ScheduleTab({ project }: { project: Project }) {
  return (
    <div className="rounded-2xl bg-card p-5 ring-1 ring-border">
      <h3 className="text-sm font-semibold text-foreground">Milestone schedule</h3>
      <ol className="mt-4 space-y-0">
        {project.milestones.map((m, i) => (
          <MilestoneRow key={m.name} milestone={m} last={i === project.milestones.length - 1} />
        ))}
      </ol>
    </div>
  )
}

function MilestoneRow({ milestone, last }: { milestone: ScheduleMilestone; last: boolean }) {
  const dot =
    milestone.status === "complete"
      ? "bg-success"
      : milestone.status === "in-progress"
        ? "bg-primary ring-4 ring-primary/15"
        : "bg-muted-foreground/40"
  return (
    <li className="flex gap-4">
      <div className="flex flex-col items-center">
        <span className={cn("mt-1 size-3 shrink-0 rounded-full", dot)} />
        {!last ? <span className="my-1 w-px flex-1 bg-border" /> : null}
      </div>
      <div className={cn("pb-5", last && "pb-0")}>
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground">{milestone.name}</p>
          {milestone.critical ? (
            <span className="rounded bg-accent px-1.5 py-0.5 text-xs font-medium text-accent-foreground">
              Critical path
            </span>
          ) : null}
        </div>
        <p className="text-xs text-muted-foreground">
          {milestone.date} ·{" "}
          <span className="capitalize">{milestone.status.replace("-", " ")}</span>
          {milestone.health !== "on-track" ? (
                <span className={milestone.health === "critical" ? "text-danger-strong" : "text-warning-strong"}>
              {" "}
              · {healthLabel[milestone.health]}
            </span>
          ) : null}
        </p>
      </div>
    </li>
  )
}

function CostTab({ project }: { project: Project }) {
  const totals = project.sov.reduce(
    (acc, l) => ({
      budget: acc.budget + l.budget,
      committed: acc.committed + l.committed,
      spent: acc.spent + l.spent,
    }),
    { budget: 0, committed: 0, spent: 0 },
  )
  return (
    <div className="rounded-2xl bg-card ring-1 ring-border">
      <div className="border-b border-border px-5 py-4">
        <h3 className="text-sm font-semibold text-foreground">Schedule of values</h3>
        <p className="text-xs text-muted-foreground">Budget, committed, and spent by division.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-5 py-2.5 font-medium">Division</th>
              <th className="px-3 py-2.5 text-right font-medium">Budget</th>
              <th className="px-3 py-2.5 text-right font-medium">Committed</th>
              <th className="px-3 py-2.5 text-right font-medium">Spent</th>
              <th className="px-5 py-2.5 text-right font-medium">% spent</th>
            </tr>
          </thead>
          <tbody>
            {project.sov.map((l) => {
              const pct = Math.round((l.spent / l.budget) * 100)
              return (
                <tr key={l.code} className="border-b border-border/70">
                  <td className="px-5 py-3">
                    <p className="font-medium text-foreground">{l.description}</p>
                    <p className="text-xs text-muted-foreground tabular-nums">Div {l.code}</p>
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums text-muted-foreground">{formatCurrency(l.budget)}</td>
                  <td className="px-3 py-3 text-right tabular-nums text-muted-foreground">{formatCurrency(l.committed)}</td>
                  <td className="px-3 py-3 text-right tabular-nums font-medium text-foreground">{formatCurrency(l.spent)}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Meter className="w-16" value={pct} tone={l.committed > l.budget ? "warning" : "info"} />
                      <span className="w-9 text-right tabular-nums text-xs text-muted-foreground">{pct}%</span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr className="bg-muted/50 font-semibold text-foreground">
              <td className="px-5 py-3">Total</td>
              <td className="px-3 py-3 text-right tabular-nums">{formatCurrency(totals.budget)}</td>
              <td className="px-3 py-3 text-right tabular-nums">{formatCurrency(totals.committed)}</td>
              <td className="px-3 py-3 text-right tabular-nums">{formatCurrency(totals.spent)}</td>
              <td className="px-5 py-3 text-right tabular-nums">
                {Math.round((totals.spent / totals.budget) * 100)}%
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

function LogTable({ columns, rows }: { columns: string[]; rows: string[][] }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-border">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              {columns.map((c) => (
                <th key={c} className="px-5 py-2.5 font-medium">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row[0]} className="border-b border-border/70 last:border-0">
                <td className="px-5 py-3 font-medium tabular-nums text-foreground">{row[0]}</td>
                <td className="px-5 py-3 text-foreground">{row[1]}</td>
                <td className="px-5 py-3">
                  <StatusPill tone={statusToTone(row[2])}>{row[2]}</StatusPill>
                </td>
                <td className="px-5 py-3 text-muted-foreground">{row[3]}</td>
                <td className="px-5 py-3 text-muted-foreground">{row[4]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function FieldTab({ project }: { project: Project }) {
  return (
    <div className="space-y-4">
      {project.field.map((report) => (
        <FieldReportCard key={report.id} report={report} />
      ))}
    </div>
  )
}

function FieldReportCard({ report }: { report: FieldReport }) {
  return (
    <div className="rounded-2xl bg-card p-5 ring-1 ring-border">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">
            Daily Report {report.id}
            <span className="ml-2 font-normal text-muted-foreground">{report.date}</span>
          </p>
          <p className="text-xs text-muted-foreground">by {report.author}</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Users className="size-3.5" />
            {report.crew} crew
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CloudSun className="size-3.5" />
            {report.weather}
          </span>
        </div>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-foreground/90">{report.summary}</p>
      {report.observations.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {report.observations.map((o, i) => (
            <li key={i} className="flex items-start gap-2 rounded-lg bg-muted/60 px-3 py-2 text-sm">
              <Hammer
                className={cn(
                  "mt-0.5 size-3.5 shrink-0",
                  o.severity === "critical" ? "text-danger" : o.severity === "at-risk" ? "text-warning" : "text-success",
                )}
              />
              <span>
                <span className="font-medium capitalize text-foreground">{o.type}</span>
                <span className="text-foreground/80"> — {o.note}</span>
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
