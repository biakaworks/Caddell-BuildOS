"use client"

import Link from "next/link"
import {
  FileQuestion,
  FileCheck2,
  CalendarClock,
  Target,
  ShieldAlert,
  ChevronRight,
  ArrowRight,
  TrendingUp,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  KPIS,
  ATTENTION_ITEMS,
  ACTIVITY,
  PURSUITS,
  PURSUIT_STAGES,
  formatCurrency,
  type AttentionType,
  type Kpi,
} from "@/lib/mock-data"
import { useApp } from "./app-context"
import { Sparkline, TrendDelta, StatusPill, SectionHeading } from "./ui"
import { PhaseBadge, PreviewBlock } from "./phase"

const intentMap: Record<Kpi["intent"], { bar: string; spark: string }> = {
  good: { bar: "bg-success", spark: "stroke-success" },
  warn: { bar: "bg-warning", spark: "stroke-warning" },
  bad: { bar: "bg-danger", spark: "stroke-danger" },
  neutral: { bar: "bg-primary", spark: "stroke-primary" },
}

export function KpiTiles() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
      {KPIS.map((kpi) => {
        const c = intentMap[kpi.intent]
        return (
          <Card
            key={kpi.id}
            className="group relative gap-0 overflow-hidden p-4 transition-shadow hover:shadow-md"
          >
            <span className={cn("absolute inset-x-0 top-0 h-0.5", c.bar)} />
            <p className="text-xs font-medium text-muted-foreground">{kpi.label}</p>
            <div className="mt-2 flex items-end justify-between gap-2">
              <span className="font-heading text-2xl font-semibold tracking-tight tabular-nums text-foreground">
                {kpi.value}
              </span>
              <Sparkline data={kpi.spark} strokeClass={c.spark} width={64} height={24} />
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <TrendDelta value={kpi.delta} goodWhenUp={kpi.goodWhenUp} />
              <span className="truncate text-[11px] text-muted-foreground">{kpi.deltaLabel}</span>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

const attentionIcon: Record<AttentionType, typeof FileQuestion> = {
  rfi: FileQuestion,
  submittal: FileCheck2,
  schedule: CalendarClock,
  pursuit: Target,
  safety: ShieldAlert,
}

export function NeedsAttention() {
  const { unit } = useApp()
  const items = ATTENTION_ITEMS.filter((i) => unit === "All" || i.unit === unit)

  return (
    <Card className="gap-0 overflow-hidden p-0">
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-2">
          <h2 className="font-heading text-base font-semibold tracking-tight text-foreground">
            Needs Attention
          </h2>
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-danger-muted px-1.5 text-xs font-semibold text-danger">
            {items.length}
          </span>
        </div>
        <Link href="/projects" className="text-xs font-medium text-primary hover:underline">
          View all
        </Link>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="Nothing needs attention"
          body={`No overdue or at-risk items for ${unit === "All" ? "any unit" : unit}.`}
        />
      ) : (
        <ul className="divide-y divide-border">
          {items.map((item) => {
            const Icon = attentionIcon[item.type]
            const critical = item.severity === "critical"
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className="flex min-h-11 items-start gap-3 p-4 transition-colors hover:bg-accent/50"
                >
                  <span
                    className={cn(
                      "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg",
                      critical ? "bg-danger-muted text-danger-strong" : "bg-warning-muted text-warning-strong",
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {item.project} · {item.meta}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <StatusPill tone={critical ? "danger" : "warning"}>
                      {critical ? "Critical" : "At risk"}
                    </StatusPill>
                    <span className="text-[11px] text-muted-foreground">{item.age}</span>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}

export function PipelineMini() {
  const { unit } = useApp()
  const stages = PURSUIT_STAGES.filter((s) => s !== "Won" && s !== "Lost")
  const active = PURSUITS.filter(
    (p) => (unit === "All" || p.unit === unit) && p.stage !== "Won" && p.stage !== "Lost",
  )
  const byStage = stages.map((stage) => {
    const items = active.filter((p) => p.stage === stage)
    return {
      stage,
      count: items.length,
      value: items.reduce((sum, p) => sum + p.value, 0),
    }
  })
  const maxCount = Math.max(1, ...byStage.map((s) => s.count))
  const totalValue = active.reduce((sum, p) => sum + p.value, 0)

  return (
    <Card className="gap-0 p-0">
      <div className="flex items-center justify-between border-b border-border p-4">
        <SectionHeading title="Pursuit Pipeline" />
        <Link href="/pursuits" className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
          Open board <ChevronRight className="size-3.5" />
        </Link>
      </div>
      <div className="p-4">
        <div className="mb-4 flex items-baseline gap-2">
          <span className="font-heading text-xl font-semibold tabular-nums text-foreground">
            {formatCurrency(totalValue)}
          </span>
          <span className="text-xs text-muted-foreground">weighted across {active.length} active pursuits</span>
        </div>
        <div className="space-y-3">
          {byStage.map((s) => (
            <div key={s.stage} className="flex items-center gap-3">
              <span className="w-24 shrink-0 text-sm text-muted-foreground">{s.stage}</span>
              <div className="h-7 flex-1 overflow-hidden rounded-md bg-muted">
                <div
                  className="flex h-full items-center justify-end rounded-md bg-primary/85 px-2 transition-all duration-500"
                  style={{ width: `${Math.max(12, (s.count / maxCount) * 100)}%` }}
                >
                  <span className="text-xs font-semibold text-primary-foreground tabular-nums">{s.count}</span>
                </div>
              </div>
              <span className="w-14 shrink-0 text-right text-xs text-muted-foreground tabular-nums">
                {s.value > 0 ? formatCurrency(s.value) : "—"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

export function ActivityFeed() {
  const { unit } = useApp()
  const items = ACTIVITY.filter((a) => unit === "All" || a.unit === unit)
  return (
    <Card className="gap-0 p-0">
      <div className="border-b border-border p-4">
        <SectionHeading title="Recent Activity" />
      </div>
      <ul className="p-2">
        {items.map((a) => (
          <li key={a.id} className="flex items-start gap-3 rounded-lg p-2.5">
            <Avatar className="size-8">
              <AvatarFallback
                className={cn(
                  "text-[11px] font-semibold",
                  a.initials === "AI" ? "bg-primary/10 text-primary" : "bg-secondary text-secondary-foreground",
                )}
              >
                {a.initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm leading-snug text-foreground">
                <span className="font-medium">{a.actor}</span>{" "}
                <span className="text-muted-foreground">{a.action}</span>{" "}
                <span className="font-medium">{a.target}</span>
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{a.time}</p>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  )
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string
  body: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
      <div className="flex size-10 items-center justify-center rounded-full bg-success-muted text-success">
        <FileCheck2 className="size-5" />
      </div>
      <p className="font-medium text-foreground">{title}</p>
      <p className="max-w-xs text-sm text-muted-foreground">{body}</p>
      {action}
    </div>
  )
}

const PREDICTIONS = [
  {
    project: "Riverside Medical Tower",
    signal: "Schedule slip risk",
    detail: "Steel delivery variance trending toward a 3-week critical-path impact.",
    confidence: "High",
    tone: "bad" as const,
  },
  {
    project: "Gulf Logistics Hub",
    signal: "Margin erosion",
    detail: "Change-order velocity outpacing approvals; forecast fee down 1.2 pts.",
    confidence: "Medium",
    tone: "warn" as const,
  },
  {
    project: "Northgate Mixed-Use",
    signal: "Early completion",
    detail: "Concrete pace +8% vs. plan — likely 2 weeks ahead at topping out.",
    confidence: "Medium",
    tone: "good" as const,
  },
]

const predictionTone: Record<"good" | "warn" | "bad", string> = {
  good: "bg-success-muted text-success-strong",
  warn: "bg-warning-muted text-warning-strong",
  bad: "bg-danger-muted text-danger-strong",
}

export function PredictiveInsights() {
  const { unit } = useApp()
  void unit
  return (
    <Card className="gap-0 p-0">
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-2">
          <SectionHeading title="Predictive Insights" />
          <PhaseBadge phase={3} />
        </div>
        <span className="text-xs text-muted-foreground">Forecasted from portfolio signals</span>
      </div>
      <PreviewBlock phase={3} ribbon={false} className="border-0 p-2 ring-0">
        <ul className="divide-y divide-border">
          {PREDICTIONS.map((p) => (
            <li key={p.project} className="flex items-start gap-3 rounded-lg p-2.5">
              <span className={cn("mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg", predictionTone[p.tone])}>
                <TrendingUp className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">
                  {p.signal}
                  <span className="ml-1.5 font-normal text-muted-foreground">· {p.project}</span>
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">{p.detail}</p>
              </div>
              <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                {p.confidence}
              </span>
            </li>
          ))}
        </ul>
      </PreviewBlock>
    </Card>
  )
}

export function PromoStrip() {
  const { openAsk } = useApp()
  return (
    <Card className="flex flex-col items-start justify-between gap-4 border-primary/20 bg-primary/[0.04] p-5 sm:flex-row sm:items-center">
      <div>
        <h3 className="font-heading text-sm font-semibold text-foreground">
          Start a pursuit from history, not a blank page
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Ask BuildOS to surface comparable past work, win themes, and subcontractor performance.
        </p>
      </div>
      <Button onClick={() => openAsk("Draft win themes for the Coastal Data Center pursuit")} className="shrink-0">
        Ask BuildOS <ArrowRight className="size-4" />
      </Button>
    </Card>
  )
}
