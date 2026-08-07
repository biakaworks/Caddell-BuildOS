"use client"

import { useState } from "react"
import Link from "next/link"
import { BIDS } from "@/lib/data/fixtures"
import { BID_STATUSES } from "@/lib/types"
import type { BidStatus } from "@/lib/types"
import { PageContainer, PageHeader, StatusPill, statusToTone, StatTile, SectionHeading } from "./ui"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

const STATUS_ORDER: BidStatus[] = ["Received", "In Takeoff", "Pricing", "Submitted", "Awarded", "Lost"]

function BidStatusBadge({ status }: { status: BidStatus }) {
  return <StatusPill tone={statusToTone(status)}>{status}</StatusPill>
}

export function BidsList() {
  const [filterStatus, setFilterStatus] = useState<BidStatus | "All">("All")

  const filtered = BIDS.filter((b) =>
    filterStatus === "All" ? true : b.status === filterStatus
  ).sort((a, b) => new Date(a.bidDueDate).getTime() - new Date(b.bidDueDate).getTime())

  const activeCount   = BIDS.filter((b) => !["Awarded", "Lost"].includes(b.status)).length
  const awardedTotal  = BIDS.filter((b) => b.status === "Awarded").length
  const upcomingCount = BIDS.filter((b) => {
    const due = new Date(b.bidDueDate)
    const now = new Date("2026-08-07")
    return due >= now && due <= new Date(now.getTime() + 7 * 86_400_000)
  }).length

  return (
    <PageContainer>
      <PageHeader
        title="Bids"
        subtitle={`${activeCount} active bids · ${awardedTotal} awarded this period`}
      >
        <Link href="/bids/new">
          <Button size="sm" className="gap-1.5">
            <Plus className="size-4" />
            New Bid
          </Button>
        </Link>
      </PageHeader>

      {/* KPI strip */}
      <div className="mt-5 grid grid-cols-2 gap-px bg-border sm:grid-cols-4">
        <StatTile label="Active Bids"    value={activeCount}        tone="info" />
        <StatTile label="Due This Week"  value={upcomingCount}      tone={upcomingCount > 0 ? "warning" : "neutral"} />
        <StatTile label="Awarded"        value={awardedTotal}       tone="success" />
        <StatTile label="Total Tracked"  value={BIDS.length}        tone="neutral" />
      </div>

      {/* Status filter */}
      <div className="mt-5 flex flex-wrap gap-2">
        {(["All", ...STATUS_ORDER] as (BidStatus | "All")[]).map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={cn(
              "px-3 py-1 text-xs border transition-colors",
              filterStatus === s
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Bids table */}
      <div className="mt-4 border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {["Ref", "Project", "GC", "Systems", "Bid Due", "Est Hrs", "Estimator", "Status"].map((c) => (
                <th key={c} className="px-4 py-2.5 text-left text-[11px] font-normal text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((bid) => {
              const isPast = new Date(bid.bidDueDate) < new Date("2026-08-07")
              const isUrgent = !isPast && new Date(bid.bidDueDate) <= new Date("2026-08-14")
              return (
                <tr key={bid.ref} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      href={`/bids/${bid.ref}`}
                      className="text-primary hover:underline text-xs tabular-nums"
                    >
                      {bid.ref}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/bids/${bid.ref}`} className="hover:text-primary">
                      <p className="text-foreground">{bid.projectName}</p>
                      <p className="text-[11px] text-muted-foreground">{bid.city}, {bid.state} · {bid.sector}</p>
                      {bid.shutdownConstraint && (
                        <p className="text-[10px] text-warning">Shutdown: {bid.shutdownConstraint}</p>
                      )}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{bid.gc}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {bid.systems.map((s) => (
                        <span key={s} data-pill className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className={cn("px-4 py-3 whitespace-nowrap text-xs tabular-nums", isUrgent && "text-warning", isPast && !["Submitted","Awarded","Lost"].includes(bid.status) && "text-danger")}>
                    {new Date(bid.bidDueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    {isUrgent && <span className="ml-1 text-[10px]">⚑</span>}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-muted-foreground">{bid.estimatedHours}h</td>
                  <td className="px-4 py-3 text-muted-foreground">{bid.estimator}</td>
                  <td className="px-4 py-3">
                    <BidStatusBadge status={bid.status} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            No bids match this filter.
          </div>
        )}
      </div>
    </PageContainer>
  )
}

// ─── Bid Detail ───────────────────────────────────────────────────────────────
export function BidDetail({ bidRef }: { bidRef: string }) {
  const bid = BIDS.find((b) => b.ref === bidRef)

  if (!bid) {
    return (
      <PageContainer>
        <p className="text-muted-foreground">Bid not found: {bidRef}</p>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <Link
        href="/bids"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        ← All bids
      </Link>

      <div className="mt-3 border-b border-border pb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <BidStatusBadge status={bid.status} />
            <span className="text-xs text-muted-foreground tabular-nums">{bid.ref}</span>
          </div>
          <h1 className="text-2xl text-foreground" style={{ letterSpacing: "-0.03em" }}>
            {bid.projectName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {bid.city}, {bid.state} · {bid.sector} · {bid.gc}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-muted-foreground">Bid Due</p>
          <p className="text-xl text-foreground tabular-nums" style={{ letterSpacing: "-0.02em" }}>
            {new Date(bid.bidDueDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          <div className="border border-border bg-card divide-y divide-border">
            <div className="px-4 py-3 border-b border-border">
              <SectionHeading title="Bid Details" />
            </div>
            {[
              { label: "Estimator",         value: bid.estimator },
              { label: "Estimated Hours",   value: `${bid.estimatedHours} hours` },
              { label: "Systems",           value: bid.systems.join(", ") },
              { label: "GC",               value: bid.gc },
              { label: "Sector",           value: bid.sector },
              { label: "Location",         value: `${bid.city}, ${bid.state}` },
              ...(bid.shutdownConstraint ? [{ label: "Shutdown Constraint", value: bid.shutdownConstraint }] : []),
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between px-4 py-2.5">
                <span className="text-[11px] text-muted-foreground">{label}</span>
                <span className="text-[12px] text-foreground">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions panel */}
        <div className="border border-border bg-card p-4 h-fit">
          <SectionHeading title="Status" className="mb-3" />
          <div className="space-y-2">
            {BID_STATUSES.map((s) => (
              <div
                key={s}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-xs",
                  s === bid.status ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                )}
              >
                <span className={cn(
                  "size-1.5 rounded-full",
                  s === bid.status ? "bg-primary-foreground" : "bg-border"
                )} />
                {s}
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  )
}

// ─── New Bid Form ─────────────────────────────────────────────────────────────
export function NewBidForm() {
  return (
    <PageContainer>
      <Link
        href="/bids"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        ← All bids
      </Link>

      <div className="mt-3 border-b border-border pb-5">
        <h1 className="text-2xl text-foreground" style={{ letterSpacing: "-0.03em" }}>
          New Bid
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a new bid opportunity and assign an estimator.
        </p>
      </div>

      <form className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]" onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-4">
          {[
            { id: "projectName", label: "Project Name", placeholder: "e.g. Carthage R9 Middle School" },
            { id: "gc",          label: "General Contractor", placeholder: "e.g. Dillard Smith Construction" },
            { id: "city",        label: "City", placeholder: "e.g. Carthage" },
          ].map(({ id, label, placeholder }) => (
            <div key={id}>
              <label htmlFor={id} className="block text-xs text-muted-foreground mb-1.5">{label}</label>
              <input
                id={id}
                type="text"
                placeholder={placeholder}
                className="w-full border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          ))}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="state" className="block text-xs text-muted-foreground mb-1.5">State</label>
              <select
                id="state"
                className="w-full border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {["MO", "KS", "AR", "OK"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="sector" className="block text-xs text-muted-foreground mb-1.5">Sector</label>
              <select
                id="sector"
                className="w-full border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {["Education", "Healthcare", "Commercial", "Industrial", "Hospitality / Civic"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="bidDueDate" className="block text-xs text-muted-foreground mb-1.5">Bid Due Date</label>
              <input
                id="bidDueDate"
                type="date"
                className="w-full border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label htmlFor="estimatedHours" className="block text-xs text-muted-foreground mb-1.5">Estimated Hours</label>
              <input
                id="estimatedHours"
                type="number"
                placeholder="e.g. 40"
                className="w-full border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          <div>
            <label htmlFor="estimator" className="block text-xs text-muted-foreground mb-1.5">Estimator</label>
            <select
              id="estimator"
              className="w-full border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option>Chad Merritt</option>
              <option>Lindsey Park</option>
            </select>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-2">Systems (select all that apply)</p>
            <div className="flex flex-wrap gap-2">
              {["Curtain Wall", "Storefront", "Entrances", "Operators", "Specialty Glass", "Glass Replacement"].map((s) => (
                <label key={s} className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" className="accent-primary" />
                  <span className="text-xs text-foreground">{s}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="shutdownConstraint" className="block text-xs text-muted-foreground mb-1.5">
              Shutdown Constraint <span className="text-muted-foreground/50">(optional)</span>
            </label>
            <input
              id="shutdownConstraint"
              type="text"
              placeholder="e.g. Summer 2027"
              className="w-full border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="border border-border bg-card p-4 h-fit">
          <SectionHeading title="Initial Status" className="mb-3" />
          <p className="text-xs text-muted-foreground mb-3">New bids start in Received status.</p>
          <StatusPill tone="info">Received</StatusPill>

          <div className="mt-6 pt-4 border-t border-border">
            <Button type="submit" className="w-full">Create Bid</Button>
            <Link href="/bids">
              <Button variant="ghost" className="w-full mt-2">Cancel</Button>
            </Link>
          </div>
        </div>
      </form>
    </PageContainer>
  )
}
