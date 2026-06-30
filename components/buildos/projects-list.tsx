"use client"

import { useMemo } from "react"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { PROJECTS, formatCurrency, type Health, type Project } from "@/lib/mock-data"
import { useApp } from "@/components/buildos/app-context"
import { HealthDot, Meter, PageContainer, PageHeader } from "@/components/buildos/ui"
import { cn } from "@/lib/utils"

const healthLabel: Record<Health, string> = {
  "on-track": "On track",
  "at-risk": "At risk",
  critical: "Critical",
}
export function ProjectsList() {
  const { unit } = useApp()
  const projects = useMemo(
    () => PROJECTS.filter((p) => unit === "All" || p.unit === unit),
    [unit],
  )

  return (
    <PageContainer>
      <PageHeader
        title="Projects"
        subtitle="Active construction projects across the portfolio. Select a project for the full operating picture."
      />

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {projects.map((p) => (
          <ProjectCard key={p.slug} project={p} />
        ))}
      </div>
    </PageContainer>
  )
}

function ProjectCard({ project }: { project: Project }) {
  const meterTone =
    project.scheduleHealth === "critical" ? "danger" : project.scheduleHealth === "at-risk" ? "warning" : "success"
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group flex flex-col rounded-2xl bg-card p-5 ring-1 ring-border transition-all hover:ring-primary/40 hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-foreground text-balance">{project.name}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {project.market} · {project.location}
          </p>
        </div>
        <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <Metric label="Contract" value={formatCurrency(project.contractValue)} />
        <Metric label="Delivery" value={project.delivery} />
        <Metric
          label="Budget var."
          value={`${project.budgetVariancePct > 0 ? "+" : ""}${project.budgetVariancePct}%`}
          tone={project.budgetVariancePct > 2 ? "warn" : "neutral"}
        />
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{project.percentComplete}% complete</span>
          <HealthDot health={project.scheduleHealth} />
          <span className="sr-only">{healthLabel[project.scheduleHealth]}</span>
        </div>
        <Meter className="mt-2" value={project.percentComplete} tone={meterTone} />
      </div>
    </Link>
  )
}

function Metric({ label, value, tone = "neutral" }: { label: string; value: string; tone?: "neutral" | "warn" }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("mt-0.5 text-sm font-semibold tabular-nums", tone === "warn" ? "text-warning-strong" : "text-foreground")}>
        {value}
      </p>
    </div>
  )
}
