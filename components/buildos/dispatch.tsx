"use client"

import { useState } from "react"
import { Zap, Phone, MapPin, Clock } from "lucide-react"
import { TICKETS } from "@/lib/data/fixtures"
import { fmtDate, fmtDateTime } from "@/lib/format"
import type { TicketStatus } from "@/lib/types"
import { PageContainer, PageHeader, StatusPill, statusToTone, StatTile, SectionHeading } from "./ui"
import { cn } from "@/lib/utils"

const STATUS_FLOW: TicketStatus[] = ["New", "Dispatched", "En Route", "On Site", "Made Safe", "Resolved"]

const STATUS_DOT: Record<TicketStatus, string> = {
  New:        "bg-danger animate-pulse",
  Dispatched: "bg-warning",
  "En Route": "bg-warning",
  "On Site":  "bg-primary",
  "Made Safe":"bg-success",
  Resolved:   "bg-muted-foreground/40",
}

// Fixed demo "now" so relative times are deterministic (identical on server and
// client, avoiding hydration mismatch) and sensible against the 2026 fixtures.
const DEMO_NOW = new Date("2026-08-07T12:00:00Z").getTime()

function elapsed(dateStr: string) {
  const ms = DEMO_NOW - new Date(dateStr).getTime()
  const mins = Math.floor(ms / 60_000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export function EmergencyDispatch() {
  const [selected, setSelected] = useState<string | null>(TICKETS[0]?.id ?? null)

  const active   = TICKETS.filter((t) => t.status !== "Resolved")
  const resolved = TICKETS.filter((t) => t.status === "Resolved")

  const selectedTicket = TICKETS.find((t) => t.id === selected)

  return (
    <PageContainer>
      <PageHeader
        title="Emergency Dispatch"
        subtitle="Service calls · glass repair · after-hours emergency glazing"
      />

      {/* KPI strip */}
      <div className="mt-5 grid grid-cols-2 gap-px bg-border sm:grid-cols-4">
        <StatTile label="Open Tickets"   value={active.length}    tone={active.length > 0 ? "danger" : "success"} />
        <StatTile label="New / Unassigned" value={TICKETS.filter((t) => t.status === "New").length} tone="warning" />
        <StatTile label="On Site"         value={TICKETS.filter((t) => t.status === "On Site").length}  tone="info" />
        <StatTile label="Resolved Today"  value={resolved.length}  tone="neutral" />
      </div>

      {/* Main split view */}
      <div className="mt-6 flex gap-px bg-border h-[600px] overflow-hidden">
        {/* Ticket list */}
        <div className="w-72 shrink-0 bg-card overflow-y-auto flex flex-col">
          <div className="border-b border-border px-3 py-2.5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Active</p>
          </div>
          <div className="flex-1 divide-y divide-border">
            {active.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelected(t.id)}
                className={cn(
                  "w-full text-left px-3 py-3 hover:bg-muted/30 transition-colors",
                  selected === t.id && "bg-muted/50"
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn("size-2 rounded-full shrink-0", STATUS_DOT[t.status])} />
                  <span className="text-[11px] text-muted-foreground tabular-nums">{t.id}</span>
                  <span className="ml-auto text-[10px] text-muted-foreground/60">{elapsed(t.reportedAt)}</span>
                </div>
                <p className="text-xs text-foreground truncate">{t.location}</p>
                <p className="text-[11px] text-muted-foreground truncate">{t.opening}</p>
                <StatusPill tone={statusToTone(t.status)} className="mt-1.5 text-[10px]">{t.status}</StatusPill>
              </button>
            ))}
          </div>
          <div className="border-t border-border">
            <div className="px-3 py-2">
              <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider mb-1">Resolved</p>
            </div>
            {resolved.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelected(t.id)}
                className={cn(
                  "w-full text-left px-3 py-3 hover:bg-muted/30 transition-colors opacity-60",
                  selected === t.id && "opacity-100 bg-muted/50"
                )}
              >
                <p className="text-xs text-foreground truncate">{t.location}</p>
                <p className="text-[11px] text-muted-foreground truncate">{t.id} · {t.status}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Ticket detail */}
        <div className="flex-1 bg-card overflow-y-auto">
          {selectedTicket ? (
            <TicketDetail ticket={selectedTicket} />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Select a ticket to view details
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  )
}

function TicketDetail({ ticket }: { ticket: (typeof TICKETS)[number] }) {
  const steps = [
    { label: "Reported",    time: ticket.reportedAt },
    { label: "Dispatched",  time: ticket.dispatchedAt },
    { label: "En Route",    time: ticket.enRouteAt },
    { label: "On Site",     time: ticket.onSiteAt },
    { label: "Made Safe",   time: ticket.securedAt },
    { label: "Resolved",    time: ticket.resolvedAt },
  ]

  const statusIdx = STATUS_FLOW.indexOf(ticket.status)

  return (
    <div className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Zap className="size-4 text-warning" />
            <span className="text-xs text-muted-foreground tabular-nums">{ticket.id}</span>
            <StatusPill tone={statusToTone(ticket.status)}>{ticket.status}</StatusPill>
          </div>
          <h2 className="text-lg text-foreground" style={{ letterSpacing: "-0.02em" }}>
            {ticket.location}
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">{ticket.opening}</p>
        </div>
      </div>

      {/* Hazard */}
      <div className="border border-warning/30 bg-warning-muted px-4 py-3 mb-5">
        <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">Hazard State</p>
        <p className="text-sm text-foreground">{ticket.hazardState}</p>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {ticket.techAssigned && (
          <div className="border border-border bg-background px-3 py-2.5">
            <p className="text-[10px] text-muted-foreground">Technician</p>
            <p className="text-sm text-foreground mt-0.5">{ticket.techAssigned}</p>
          </div>
        )}
        {ticket.customerPhone && (
          <div className="border border-border bg-background px-3 py-2.5 flex items-center gap-2">
            <Phone className="size-3.5 shrink-0 text-muted-foreground/50" />
            <div>
              <p className="text-[10px] text-muted-foreground">Customer Phone</p>
              <p className="text-sm text-foreground">{ticket.customerPhone}</p>
            </div>
          </div>
        )}
        {ticket.scheduledAt && (
          <div className="border border-border bg-background px-3 py-2.5 flex items-center gap-2">
            <Clock className="size-3.5 shrink-0 text-muted-foreground/50" />
            <div>
              <p className="text-[10px] text-muted-foreground">Scheduled Repair</p>
              <p className="text-sm text-foreground">
                {fmtDate(ticket.scheduledAt, { month: "short", day: "numeric", year: "numeric" })}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div>
        <SectionHeading title="Timeline" className="mb-3" />
        <ol className="space-y-0">
          {steps.map((step, i) => {
            const done = i <= statusIdx && step.time
            const active = STATUS_FLOW[statusIdx] === step.label
            return (
              <li key={step.label} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span
                    className={cn(
                      "mt-0.5 size-2.5 rounded-full shrink-0",
                      done ? "bg-success" : active ? "bg-primary ring-4 ring-primary/20" : "bg-muted-foreground/20"
                    )}
                  />
                  {i < steps.length - 1 && (
                    <span className={cn("w-px flex-1 my-1", done ? "bg-success/40" : "bg-border")} />
                  )}
                </div>
                <div className={cn("pb-3", i === steps.length - 1 && "pb-0")}>
                  <p className={cn("text-xs", done ? "text-foreground" : "text-muted-foreground/50")}>{step.label}</p>
                  {step.time && (
                    <p className="text-[10px] text-muted-foreground">
                      {fmtDateTime(step.time, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                    </p>
                  )}
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}
