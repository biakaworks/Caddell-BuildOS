"use client"

import { useMemo, useState } from "react"
import { Handshake, ShieldCheck, Search, FileText } from "lucide-react"
import { TRADE_PARTNERS, type TradePartner, type PrequalStatus } from "@/lib/mock-data"
import { PageContainer, PageHeader, StatusPill } from "@/components/buildos/ui"
import { PhaseBadge, PreviewBlock } from "@/components/buildos/phase"
import { cn } from "@/lib/utils"

const prequalTone: Record<PrequalStatus, "success" | "warning" | "danger" | "info"> = {
  Qualified: "success",
  Conditional: "warning",
  "In Review": "info",
  Expired: "danger",
}

const capacityTone = {
  Available: "success",
  "Near capacity": "warning",
  Committed: "neutral",
} as const

export function TradePartnersView() {
  const [query, setQuery] = useState("")

  const partners = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return TRADE_PARTNERS
    return TRADE_PARTNERS.filter(
      (p) => p.name.toLowerCase().includes(q) || p.trade.toLowerCase().includes(q),
    )
  }, [query])

  return (
    <PageContainer>
      <PageHeader
        title="Trade Partners"
        subtitle="Role-appropriate access for subcontractors — the bids, submittals, and coordination relevant to each partner."
      />

      {/* Phase 1 — minimal directory */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Handshake className="size-4 text-primary" />
          Active partner directory
          <span className="text-muted-foreground">({partners.length})</span>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search partners or trades…"
            aria-label="Search trade partners"
            className="h-9 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/20 sm:w-72"
          />
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl bg-card ring-1 ring-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
              <th className="px-4 py-3 font-medium">Partner</th>
              <th className="px-4 py-3 font-medium">Trade</th>
              <th className="hidden px-4 py-3 font-medium sm:table-cell">Region</th>
              <th className="px-4 py-3 text-right font-medium">Active projects</th>
              <th className="px-4 py-3 text-right font-medium">Open items</th>
            </tr>
          </thead>
          <tbody>
            {partners.map((p) => (
              <tr key={p.id} className="border-b border-border last:border-0 transition-colors hover:bg-muted/40">
                <td className="px-4 py-3">
                  <div className="font-medium text-foreground">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.tier} partner</div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{p.trade}</td>
                <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">{p.region}</td>
                <td className="px-4 py-3 text-right tabular-nums text-foreground">{p.activeProjects}</td>
                <td className="px-4 py-3 text-right">
                  {p.openItems > 0 ? (
                    <StatusPill tone={p.openItems > 3 ? "warning" : "neutral"} dot={false}>
                      {p.openItems} open
                    </StatusPill>
                  ) : (
                    <span className="text-xs text-muted-foreground">Clear</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Phase 2 — Prequalification & richer collaboration */}
      <section className="mt-10">
        <div className="mb-3 flex items-center gap-2">
          <h2 className="font-heading text-base font-semibold tracking-tight text-foreground">
            Prequalification &amp; collaboration
          </h2>
          <PhaseBadge phase={2} />
        </div>
        <p className="mb-4 max-w-2xl text-sm text-muted-foreground">
          Phase 2 expands partners into a full prequalification system — capacity, safety rating, and
          on-time performance — plus richer bid and submittal collaboration.
        </p>

        <PreviewBlock phase={2} className="bg-card">
          <div className="p-5 sm:p-6">
            <div className="grid gap-3 sm:grid-cols-3">
              <MiniStat label="Qualified partners" value="62" sub="of 71 in network" />
              <MiniStat label="Expiring prequals" value="5" sub="next 30 days" tone="warning" />
              <MiniStat label="Avg. safety EMR" value="0.87" sub="below 1.0 target" tone="success" />
            </div>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">Partner</th>
                    <th className="py-2 pr-4 font-medium">Prequal</th>
                    <th className="py-2 pr-4 font-medium">Capacity</th>
                    <th className="py-2 pr-4 text-right font-medium">Safety EMR</th>
                    <th className="py-2 text-right font-medium">On-time</th>
                  </tr>
                </thead>
                <tbody>
                  {TRADE_PARTNERS.map((p) => (
                    <tr key={p.id} className="border-b border-border last:border-0">
                      <td className="py-2.5 pr-4 font-medium text-foreground">{p.name}</td>
                      <td className="py-2.5 pr-4">
                        <StatusPill tone={prequalTone[p.prequal]}>{p.prequal}</StatusPill>
                      </td>
                      <td className="py-2.5 pr-4">
                        <StatusPill tone={capacityTone[p.capacity]} dot={false}>
                          {p.capacity}
                        </StatusPill>
                      </td>
                      <td className={cn("py-2.5 pr-4 text-right tabular-nums", p.safetyEmr > 1 ? "text-danger-strong" : "text-foreground")}>
                        {p.safetyEmr.toFixed(2)}
                      </td>
                      <td className="py-2.5 text-right tabular-nums text-foreground">{p.onTimePct}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <CollabCard
                icon={FileText}
                title="Bid & submittal collaboration"
                body="Shared bid packages, leveling sheets, and submittal threads scoped to each partner."
              />
              <CollabCard
                icon={ShieldCheck}
                title="Automated prequal renewals"
                body="Insurance, bonding, and safety docs tracked with expiration reminders."
              />
            </div>
          </div>
        </PreviewBlock>
      </section>
    </PageContainer>
  )
}

function MiniStat({
  label,
  value,
  sub,
  tone = "neutral",
}: {
  label: string
  value: string
  sub: string
  tone?: "neutral" | "success" | "warning"
}) {
  const valueClass =
    tone === "success" ? "text-success-strong" : tone === "warning" ? "text-warning-strong" : "text-foreground"
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className={cn("mt-1 font-heading text-2xl font-semibold tracking-tight tabular-nums", valueClass)}>
        {value}
      </p>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </div>
  )
}

function CollabCard({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof FileText
  title: string
  body: string
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-border bg-background p-4">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-info-muted text-info">
        <Icon className="size-4" />
      </span>
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{body}</p>
      </div>
    </div>
  )
}
