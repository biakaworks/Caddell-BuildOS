"use client"

import { useState } from "react"
import {
  LogOut,
  ShieldCheck,
  CalendarClock,
  CircleCheck,
  CircleDashed,
  Loader,
  Info,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { PROJECTS, type Project } from "@/lib/mock-data"
import { useApp } from "./app-context"
import { StatusPill, Meter } from "./ui"
import { CaddellCMark } from "./caddell-mark"

// Owners only see a curated subset of their own projects.
const OWNER_PROJECTS = PROJECTS.slice(0, 3)

const healthTone = { "on-track": "success", "at-risk": "warning", critical: "danger" } as const
const healthLabel = { "on-track": "On Schedule", "at-risk": "Minor Delay", critical: "Delay — Recovery Plan Active" } as const

function milestoneIcon(status: Project["milestones"][number]["status"]) {
  if (status === "complete") return CircleCheck
  if (status === "in-progress") return Loader
  return CircleDashed
}

export function OwnerPortal() {
  const { setOwnerView } = useApp()
  const [activeSlug, setActiveSlug] = useState(OWNER_PROJECTS[0].slug)
  const project = OWNER_PROJECTS.find((p) => p.slug === activeSlug) ?? OWNER_PROJECTS[0]

  const completed = project.milestones.filter((m) => m.status === "complete").length
  const onBudget = Math.abs(project.budgetVariancePct) <= 3

  return (
    <div className="flex min-h-screen flex-col bg-secondary/40">
      {/* Distinct external-facing header — clearly not the internal app */}
      <header className="sticky top-0 z-30 border-b border-border bg-card">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center gap-3 px-4 sm:px-6">
          <CaddellCMark className="size-9" />
          <div className="leading-tight">
            <div className="font-heading text-sm font-semibold tracking-tight text-foreground">
              Caddell · Owner Portal
            </div>
            <div className="text-[11px] text-muted-foreground">Meridian Development Partners</div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOwnerView(false)}
            className="ml-auto gap-1.5"
          >
            <LogOut className="size-4" />
            <span className="hidden sm:inline">Exit owner view</span>
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 lg:py-8">
        <div className="flex items-start gap-2.5 rounded-xl border border-info/25 bg-info-muted/60 px-4 py-3 text-sm text-foreground">
          <Info className="mt-0.5 size-4 shrink-0 text-info" />
          <p className="text-pretty leading-relaxed">
            This is a secure, limited view for project owners. It shows milestone progress, schedule
            status, high-level budget health, and safety — internal cost detail and team workflows stay
            inside BuildOS.
          </p>
        </div>

        {/* Project selector */}
        <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="Your projects">
          {OWNER_PROJECTS.map((p) => {
            const active = p.slug === activeSlug
            return (
              <button
                key={p.slug}
                role="tab"
                aria-selected={active}
                onClick={() => setActiveSlug(p.slug)}
                className={cn(
                  "rounded-lg border px-3.5 py-2 text-left text-sm transition-colors",
                  active
                    ? "border-accent bg-accent/10 text-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-accent/40 hover:text-foreground",
                )}
              >
                <span className="block font-medium text-foreground">{p.name}</span>
                <span className="text-xs">{p.location}</span>
              </button>
            )
          })}
        </div>

        {/* Project header */}
        <div className="mt-5 rounded-xl border border-border bg-card p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="font-heading text-2xl font-semibold tracking-tight text-balance text-foreground">
                {project.name}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {project.delivery} · {project.market} · Target completion {project.finishDate}
              </p>
            </div>
            <StatusPill tone={healthTone[project.scheduleHealth]}>
              {healthLabel[project.scheduleHealth]}
            </StatusPill>
          </div>

          <div className="mt-5">
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">Overall progress</span>
              <span className="tabular-nums text-muted-foreground">{project.percentComplete}% complete</span>
            </div>
            <Meter value={project.percentComplete} tone="info" />
          </div>
        </div>

        {/* High-level summary cards */}
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <SummaryCard
            icon={CalendarClock}
            label="Schedule"
            value={healthLabel[project.scheduleHealth]}
            tone={healthTone[project.scheduleHealth]}
            note={`${completed} of ${project.milestones.length} milestones complete`}
          />
          <SummaryCard
            icon={ShieldCheck}
            label="Budget health"
            value={onBudget ? "Within budget" : "Monitoring"}
            tone={onBudget ? "success" : "warning"}
            note={onBudget ? "Tracking to approved contract value" : "Variance under active review"}
          />
          <SummaryCard
            icon={ShieldCheck}
            label="Safety"
            value="0 recordables"
            tone="success"
            note="184 days without a lost-time incident"
          />
        </div>

        {/* Milestone timeline */}
        <section className="mt-5 rounded-xl border border-border bg-card p-5 sm:p-6">
          <h2 className="font-heading text-base font-semibold tracking-tight text-foreground">
            Milestone timeline
          </h2>
          <ol className="mt-4 space-y-1">
            {project.milestones.map((m, i) => {
              const Icon = milestoneIcon(m.status)
              const last = i === project.milestones.length - 1
              return (
                <li key={m.name} className="relative flex gap-3 pb-5 last:pb-0">
                  {!last && <span className="absolute left-[11px] top-7 h-[calc(100%-1rem)] w-px bg-border" />}
                  <Icon
                    className={cn(
                      "mt-0.5 size-6 shrink-0",
                      m.status === "complete"
                        ? "text-success"
                        : m.status === "in-progress"
                          ? "text-info"
                          : "text-muted-foreground/50",
                    )}
                  />
                  <div className="flex flex-1 flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className={cn("text-sm font-medium", m.status === "upcoming" ? "text-muted-foreground" : "text-foreground")}>
                        {m.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{m.date}</p>
                    </div>
                    {m.status === "in-progress" && (
                      <StatusPill tone={healthTone[m.health]}>
                        {m.health === "on-track" ? "In progress" : healthLabel[m.health]}
                      </StatusPill>
                    )}
                    {m.status === "complete" && (
                      <span className="text-xs font-medium text-success-strong">Complete</span>
                    )}
                  </div>
                </li>
              )
            })}
          </ol>
        </section>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Questions? Contact your Caddell project executive · Updated daily
        </p>
      </main>
    </div>
  )
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  note,
  tone,
}: {
  icon: typeof CalendarClock
  label: string
  value: string
  note: string
  tone: "success" | "warning" | "danger" | "info"
}) {
  const iconTone = {
    success: "bg-success-muted text-success-strong",
    warning: "bg-warning-muted text-warning-strong",
    danger: "bg-danger-muted text-danger-strong",
    info: "bg-info-muted text-info",
  }[tone]
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2.5">
        <span className={cn("flex size-8 items-center justify-center rounded-lg", iconTone)}>
          <Icon className="size-4" />
        </span>
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      </div>
      <p className="mt-3 font-heading text-lg font-semibold tracking-tight text-foreground">{value}</p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{note}</p>
    </div>
  )
}
