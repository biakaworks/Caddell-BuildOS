"use client"

import Link from "next/link"
import { Check, ArrowRight, Smartphone } from "lucide-react"
import { PageContainer, PageHeader } from "@/components/buildos/ui"
import { PhaseBadge } from "@/components/buildos/phase"
import { cn } from "@/lib/utils"

type PhasePlan = {
  phase: 1 | 2 | 3
  name: string
  focus: string
  outcome: string
  status: "Building now" | "Next" | "Future"
  features: string[]
  accent: string
  dot: string
}

const PLAN: PhasePlan[] = [
  {
    phase: 1,
    name: "Foundation",
    focus: "The buildable core operating platform.",
    outcome: "One source of truth from pursuit to closeout — fully usable day one.",
    status: "Building now",
    accent: "ring-success/30",
    dot: "bg-success",
    features: [
      "Dashboard (Pulse) portfolio health",
      "Pursuits pipeline with comparable past work",
      "Conceptual estimating from historical assemblies",
      "Project detail: schedule, budget, RFIs, submittals, field",
      "Knowledge search with cited AI answers",
      "Ask BuildOS assistant with sources",
      "Executive reporting roll-ups",
      "Trade partner directory (minimal)",
    ],
  },
  {
    phase: 2,
    name: "Expansion & Integration",
    focus: "Connect the toolchain and deepen collaboration.",
    outcome: "BuildOS augments existing systems and brings partners into the workflow.",
    status: "Next",
    accent: "ring-info/30",
    dot: "bg-info",
    features: [
      "Integrations hub (ERP, scheduling, DMS, BIM)",
      "Subcontractor prequalification & bid collaboration",
      "Advanced estimating & risk analytics",
      "Advanced schedule & float risk panels",
      "Multi-unit & branch-office reporting roll-ups",
      "Native mobile field app (offline capable)",
    ],
  },
  {
    phase: 3,
    name: "Scale & Intelligence",
    focus: "Predictive insight and external transparency.",
    outcome: "Data-driven forecasting and benchmarking across the whole portfolio.",
    status: "Future",
    accent: "ring-warning/30",
    dot: "bg-warning",
    features: [
      "Win-probability scoring on pursuits",
      "Cost & schedule risk forecasts with confidence ranges",
      "Portfolio intelligence & benchmarking",
      "Owner / partner external portal",
      "IoT jobsite data & reality capture",
      "Clash-detection overlays",
    ],
  },
]

export function RoadmapView() {
  return (
    <PageContainer>
      <PageHeader
        title="Product Roadmap"
        subtitle="How BuildOS grows from a buildable core into a connected, intelligent platform across all three business units."
      />

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {PLAN.map((p) => (
          <article
            key={p.phase}
            className={cn(
              "flex flex-col rounded-2xl bg-card p-5 ring-1 sm:p-6",
              p.accent,
            )}
          >
            <div className="flex items-center justify-between gap-2">
              {p.phase === 1 ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-success-muted px-2 py-0.5 text-[11px] font-semibold leading-none text-success-strong">
                  <span aria-hidden className="size-1.5 rounded-full bg-current opacity-70" />
                  Phase 1
                </span>
              ) : (
                <PhaseBadge phase={p.phase} />
              )}
              <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <span className={cn("size-2 rounded-full", p.dot)} />
                {p.status}
              </span>
            </div>

            <h2 className="mt-3 font-heading text-lg font-semibold tracking-tight text-foreground">
              {p.name}
            </h2>
            <p className="mt-1 text-sm font-medium text-foreground text-pretty">{p.focus}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground text-pretty">{p.outcome}</p>

            <ul className="mt-4 flex-1 space-y-2 border-t border-border pt-4">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                  <Check
                    className={cn(
                      "mt-0.5 size-4 shrink-0",
                      p.phase === 1 ? "text-success" : p.phase === 2 ? "text-info" : "text-warning",
                    )}
                  />
                  <span className="text-pretty">{f}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      {/* Cross-links into where each phase already lives in the prototype */}
      <section className="mt-8 rounded-2xl bg-secondary/50 p-5 ring-1 ring-border sm:p-6">
        <h2 className="font-heading text-base font-semibold tracking-tight text-foreground">
          Explore it in the prototype
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Phase 2 and 3 capabilities are tagged throughout the app with preview badges. Jump straight to them:
        </p>
        <div className="mt-4 flex flex-wrap gap-2.5">
          <RoadmapLink href="/integrations" label="Integrations hub" phase={2} />
          <RoadmapLink href="/trade-partners" label="Prequalification" phase={2} />
          <RoadmapLink href="/estimating" label="Risk analytics" phase={2} />
          <RoadmapLink href="/projects/regional-logistics-center" label="Reality capture & IoT" phase={3} />
          <RoadmapLink href="/pursuits" label="Win-probability scoring" phase={3} />
          <RoadmapLink href="/reporting" label="Portfolio benchmarking" phase={3} />
        </div>
        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Smartphone className="size-4" />
          The native mobile field app preview lives on{" "}
          <Link href="/projects/regional-logistics-center" className="font-medium text-primary underline-offset-2 hover:underline">
            Project Detail
          </Link>
          .
        </div>
      </section>
    </PageContainer>
  )
}

function RoadmapLink({ href, label, phase }: { href: string; label: string; phase: 2 | 3 }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-card"
    >
      <PhaseBadge phase={phase} />
      {label}
      <ArrowRight className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </Link>
  )
}
