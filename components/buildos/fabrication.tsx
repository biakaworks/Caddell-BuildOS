"use client"

import Link from "next/link"
import { AlertTriangle } from "lucide-react"
import { FAB_ITEMS, PROJECTS } from "@/lib/data/fixtures"
import { fmtDate } from "@/lib/format"
import { FAB_STAGES } from "@/lib/types"
import type { FabStage } from "@/lib/types"
import { PageContainer, PageHeader, StatusPill, StatTile } from "./ui"
import { cn } from "@/lib/utils"

function projectName(id: string) {
  return PROJECTS.find((p) => p.id === id)?.name ?? id
}

export function FabricationBoard() {
  const blocked = FAB_ITEMS.filter((i) => i.blocked)
  const inFlight = FAB_ITEMS.filter((i) => !i.blocked && i.stage !== "Shipped")
  const shipped  = FAB_ITEMS.filter((i) => i.stage === "Shipped")

  // Group non-blocked items by stage
  const byStage: Record<FabStage, typeof FAB_ITEMS> = {
    Cut: [], Machine: [], Assemble: [], Glaze: [], Stage: [], Shipped: [],
  }
  FAB_ITEMS.forEach((item) => {
    if (!item.blocked) byStage[item.stage].push(item)
  })

  return (
    <PageContainer>
      <PageHeader
        title="Fabrication"
        subtitle="Shop floor board — all active fabrication items across the portfolio"
      />

      {/* KPI strip */}
      <div className="mt-5 grid grid-cols-2 gap-px bg-border sm:grid-cols-4">
        <StatTile label="Total Items"    value={FAB_ITEMS.length} tone="neutral" />
        <StatTile label="Blocked"        value={blocked.length}   tone={blocked.length > 0 ? "danger" : "success"} />
        <StatTile label="In Progress"    value={inFlight.length}  tone="info" />
        <StatTile label="Shipped"        value={shipped.length}   tone="success" />
      </div>

      {/* Blocked items */}
      {blocked.length > 0 && (
        <div className="mt-6 border border-danger/30 bg-danger-muted">
          <div className="border-b border-danger/20 px-4 py-3 flex items-center gap-2">
            <AlertTriangle className="size-4 text-danger" />
            <p className="text-sm text-danger">{blocked.length} blocked item{blocked.length > 1 ? "s" : ""} — action required</p>
          </div>
          <div className="divide-y divide-danger/10">
            {blocked.map((item) => (
              <div key={item.id} className="flex items-start gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/projects/${item.projectId}`}
                    className="text-[11px] text-muted-foreground hover:text-foreground"
                  >
                    {projectName(item.projectId)}
                  </Link>
                  <p className="text-sm text-foreground">{item.description}</p>
                  <p className="text-[11px] text-muted-foreground">{item.system} · {item.liteCount} lites</p>
                  {item.blockReason && (
                    <p className="mt-1 text-xs text-danger">{item.blockReason}</p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <StatusPill tone="danger">Blocked</StatusPill>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    Due {fmtDate(item.dueDate, { month: "short", day: "numeric" })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stage kanban — 6 columns */}
      <div className="mt-6 grid gap-px bg-border sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        {FAB_STAGES.filter((s) => s !== "Shipped").map((stage) => {
          const items = byStage[stage]
          return (
            <div key={stage} className="bg-card">
              <div className="border-b border-border px-3 py-2.5 flex items-center justify-between">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider">{stage}</p>
                <p className="text-sm tabular-nums text-foreground">{items.length}</p>
              </div>
              <div className="p-2 space-y-2">
                {items.map((item) => (
                  <FabCard key={item.id} item={item} />
                ))}
                {items.length === 0 && (
                  <p className="px-1 py-3 text-[10px] text-muted-foreground/40">—</p>
                )}
              </div>
            </div>
          )
        })}

        {/* Shipped column */}
        <div className="bg-card">
          <div className="border-b border-border px-3 py-2.5 flex items-center justify-between">
            <p className="text-[11px] text-success/70 uppercase tracking-wider">Shipped</p>
            <p className="text-sm tabular-nums text-foreground">{byStage["Shipped"].length}</p>
          </div>
          <div className="p-2 space-y-2">
            {byStage["Shipped"].map((item) => (
              <FabCard key={item.id} item={item} />
            ))}
            {byStage["Shipped"].length === 0 && (
              <p className="px-1 py-3 text-[10px] text-muted-foreground/40">—</p>
            )}
          </div>
        </div>
      </div>

      {/* Full items table */}
      <div className="mt-8 border border-border bg-card overflow-x-auto">
        <div className="border-b border-border px-4 py-3">
          <p className="text-sm text-foreground">All Fabrication Items</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {["Project", "Item", "System", "Lites", "Stage", "Due", "Status"].map((c) => (
                <th key={c} className="px-4 py-2.5 text-left text-[11px] font-normal text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {FAB_ITEMS.map((item) => (
              <tr key={item.id} className={cn("hover:bg-muted/30 transition-colors", item.blocked && "bg-danger-muted/30")}>
                <td className="px-4 py-3">
                  <Link href={`/projects/${item.projectId}`} className="text-[11px] text-muted-foreground hover:text-primary">
                    {projectName(item.projectId)}
                  </Link>
                </td>
                <td className="px-4 py-3 text-foreground">{item.description}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{item.system}</td>
                <td className="px-4 py-3 tabular-nums text-muted-foreground">{item.liteCount}</td>
                <td className="px-4 py-3 text-muted-foreground">{item.stage}</td>
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                  {fmtDate(item.dueDate, { month: "short", day: "numeric" })}
                </td>
                <td className="px-4 py-3">
                  {item.blocked ? (
                    <StatusPill tone="danger">Blocked</StatusPill>
                  ) : item.stage === "Shipped" ? (
                    <StatusPill tone="success">Shipped</StatusPill>
                  ) : (
                    <StatusPill tone="info">In Progress</StatusPill>
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

function FabCard({ item }: { item: (typeof FAB_ITEMS)[number] }) {
  return (
    <div className={cn(
      "border px-2 py-2 space-y-1",
      item.blocked ? "border-danger/40 bg-danger-muted/30" : "border-border bg-background"
    )}>
      <Link href={`/projects/${item.projectId}`} className="block text-[10px] text-muted-foreground hover:text-primary truncate">
        {projectName(item.projectId)}
      </Link>
      <p className="text-[11px] text-foreground leading-snug">{item.description}</p>
      <p className="text-[10px] text-muted-foreground">{item.liteCount} lites</p>
      <p className="text-[10px] text-muted-foreground/60">
        Due {fmtDate(item.dueDate, { month: "short", day: "numeric" })}
      </p>
    </div>
  )
}
