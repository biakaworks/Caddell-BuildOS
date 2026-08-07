"use client"

import Link from "next/link"
import { OPPORTUNITIES, formatCurrency } from "@/lib/data/fixtures"
import { OPPORTUNITY_STAGES } from "@/lib/types"
import type { OpportunityStage } from "@/lib/types"
import { PageContainer, PageHeader, StatusPill, SectionHeading } from "./ui"
import { cn } from "@/lib/utils"

const STAGE_TONE: Record<OpportunityStage, string> = {
  Lead:           "bg-secondary text-muted-foreground",
  Qualified:      "bg-info-muted text-info",
  Bidding:        "bg-warning-muted text-warning-strong",
  "Proposal Out": "bg-primary/10 text-primary",
  Won:            "bg-success-muted text-success-strong",
  Lost:           "bg-muted text-muted-foreground/50",
}

function stageValue(stage: OpportunityStage) {
  return OPPORTUNITIES.filter((o) => o.stage === stage).reduce((s, o) => s + o.value, 0)
}

export function PipelineBoard() {
  // Only show active stages (exclude Won/Lost from board columns — show them below)
  const activeStages: OpportunityStage[] = ["Lead", "Qualified", "Bidding", "Proposal Out"]
  const closedStages: OpportunityStage[] = ["Won", "Lost"]

  const totalPipeline = OPPORTUNITIES
    .filter((o) => !closedStages.includes(o.stage))
    .reduce((s, o) => s + o.value, 0)

  const totalWon = OPPORTUNITIES
    .filter((o) => o.stage === "Won")
    .reduce((s, o) => s + o.value, 0)

  return (
    <PageContainer>
      <PageHeader
        title="Pipeline"
        subtitle={`${formatCurrency(totalPipeline)} open pipeline · ${formatCurrency(totalWon)} won YTD`}
      />

      {/* Stage summary strip */}
      <div className="mt-5 grid grid-cols-2 gap-px bg-border sm:grid-cols-4">
        {activeStages.map((stage) => {
          const count = OPPORTUNITIES.filter((o) => o.stage === stage).length
          const value = stageValue(stage)
          return (
            <div key={stage} className="bg-card px-4 py-4">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">{stage}</p>
              <p className="mt-1 text-2xl text-foreground tabular-nums" style={{ letterSpacing: "-0.03em" }}>
                {formatCurrency(value)}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{count} {count === 1 ? "deal" : "deals"}</p>
            </div>
          )
        })}
      </div>

      {/* Kanban board */}
      <div className="mt-6 grid gap-px bg-border sm:grid-cols-2 xl:grid-cols-4">
        {activeStages.map((stage) => {
          const items = OPPORTUNITIES.filter((o) => o.stage === stage)
          return (
            <div key={stage} className="bg-card min-h-[200px]">
              <div className="border-b border-border px-3 py-2.5 flex items-center justify-between">
                <span className={cn("inline-block px-2.5 py-1 text-[11px]", STAGE_TONE[stage])}>
                  {stage}
                </span>
                <span className="text-[11px] text-muted-foreground tabular-nums">
                  {items.length}
                </span>
              </div>
              <div className="p-2 space-y-2">
                {items.map((opp) => (
                  <div key={opp.id} className="border border-border bg-background p-3 space-y-2 hover:border-primary/30 transition-colors cursor-default">
                    <p className="text-sm text-foreground leading-snug" style={{ letterSpacing: "-0.01em" }}>
                      {opp.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground">{opp.gc}</p>
                    <div className="flex flex-wrap gap-1">
                      {opp.systems.map((s) => (
                        <span key={s} data-pill className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
                          {s}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-border">
                      <span className="text-sm tabular-nums text-foreground" style={{ letterSpacing: "-0.02em" }}>
                        {formatCurrency(opp.value)}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(opp.closeDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground/60">
                      {opp.city}, {opp.state} · {opp.owner}
                    </p>
                  </div>
                ))}
                {items.length === 0 && (
                  <p className="px-2 py-3 text-[11px] text-muted-foreground/40">No deals in this stage</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Closed deals table */}
      <div className="mt-8">
        <div className="border border-border bg-card">
          <div className="border-b border-border px-4 py-3">
            <SectionHeading
              title="Closed Deals"
              description="Won and Lost opportunities from this period"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Opportunity", "GC", "Sector", "Value", "Close Date", "Owner", "Outcome"].map((c) => (
                    <th key={c} className="px-4 py-2.5 text-left text-[11px] font-normal text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {OPPORTUNITIES.filter((o) => closedStages.includes(o.stage)).map((opp) => (
                  <tr key={opp.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-foreground">{opp.name}</p>
                      <p className="text-[11px] text-muted-foreground">{opp.city}, {opp.state}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{opp.gc}</td>
                    <td className="px-4 py-3 text-muted-foreground">{opp.sector}</td>
                    <td className="px-4 py-3 tabular-nums text-foreground">{formatCurrency(opp.value)}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {new Date(opp.closeDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{opp.owner}</td>
                    <td className="px-4 py-3">
                      <StatusPill tone={opp.stage === "Won" ? "success" : "neutral"}>{opp.stage}</StatusPill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
