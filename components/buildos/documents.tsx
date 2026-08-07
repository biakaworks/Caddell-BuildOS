"use client"

import { useState } from "react"
import Link from "next/link"
import { FileText } from "lucide-react"
import { DOCUMENTS, PROJECTS } from "@/lib/data/fixtures"
import { fmtDate } from "@/lib/format"
import type { ApprovalState, DocType } from "@/lib/types"
import { PageContainer, PageHeader, StatusPill, statusToTone, StatTile } from "./ui"
import { cn } from "@/lib/utils"

const DOC_TYPES: DocType[] = ["Shop Drawing", "Submittal", "RFI", "Change Order"]
const APPROVAL_STATES: ApprovalState[] = [
  "Draft",
  "Submitted",
  "Awaiting Architect Approval",
  "Approved",
  "Revise & Resubmit",
]

function projectName(id: string) {
  return PROJECTS.find((p) => p.id === id)?.name ?? id
}

export function DocumentsView() {
  const [typeFilter, setTypeFilter] = useState<DocType | "All">("All")
  const [stateFilter, setStateFilter] = useState<ApprovalState | "All">("All")
  const [search, setSearch] = useState("")

  const filtered = DOCUMENTS.filter((d) => {
    if (typeFilter !== "All" && d.type !== typeFilter) return false
    if (stateFilter !== "All" && d.approvalState !== stateFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        d.name.toLowerCase().includes(q) ||
        projectName(d.projectId).toLowerCase().includes(q)
      )
    }
    return true
  }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

  // KPI counts
  const awaitingCount = DOCUMENTS.filter(
    (d) => d.approvalState === "Awaiting Architect Approval" || d.approvalState === "Submitted"
  ).length
  const reviseCount = DOCUMENTS.filter((d) => d.approvalState === "Revise & Resubmit").length
  const approvedCount = DOCUMENTS.filter((d) => d.approvalState === "Approved").length

  return (
    <PageContainer>
      <PageHeader
        title="Documents"
        subtitle={`${DOCUMENTS.length} tracked documents · shop drawings, submittals, RFIs, change orders`}
      />

      {/* KPI strip */}
      <div className="mt-5 grid grid-cols-2 gap-px bg-border sm:grid-cols-4">
        <StatTile label="Awaiting Approval" value={awaitingCount} tone={awaitingCount > 0 ? "warning" : "neutral"} />
        <StatTile label="Revise & Resubmit" value={reviseCount}   tone={reviseCount > 0 ? "danger" : "neutral"} />
        <StatTile label="Approved"          value={approvedCount}  tone="success" />
        <StatTile label="Total"             value={DOCUMENTS.length} tone="neutral" />
      </div>

      {/* Filters */}
      <div className="mt-5 space-y-2.5">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-[10px] text-muted-foreground/50 uppercase tracking-widest w-14 shrink-0">Type</span>
          {(["All", ...DOC_TYPES] as (DocType | "All")[]).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={cn(
                "px-3 py-1 text-xs border transition-colors",
                typeFilter === t
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground",
              )}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-[10px] text-muted-foreground/50 uppercase tracking-widest w-14 shrink-0">Status</span>
          {(["All", ...APPROVAL_STATES] as (ApprovalState | "All")[]).map((s) => (
            <button
              key={s}
              onClick={() => setStateFilter(s)}
              className={cn(
                "px-3 py-1 text-xs border transition-colors",
                stateFilter === s
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground",
              )}
            >
              {s}
            </button>
          ))}
        </div>
        <div>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by document name or project..."
            className="border border-border bg-card px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-ring w-full max-w-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="mt-4 border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {["Document", "Project", "Type", "Rev", "Status", "Updated"].map((c) => (
                <th
                  key={c}
                  className="px-4 py-2.5 text-left text-[11px] font-normal text-muted-foreground uppercase tracking-wider whitespace-nowrap"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((doc) => (
              <tr key={doc.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <FileText className="size-3.5 shrink-0 text-muted-foreground/40" />
                    <span className="text-foreground">{doc.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/projects/${doc.projectId}`}
                    className="text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    {projectName(doc.projectId)}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{doc.type}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs tabular-nums">{doc.revision}</td>
                <td className="px-4 py-3">
                  <StatusPill tone={statusToTone(doc.approvalState)}>{doc.approvalState}</StatusPill>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                  {fmtDate(doc.updatedAt, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="px-4 py-10 text-center text-sm text-muted-foreground">
            No documents match your filters.
          </div>
        )}
      </div>
    </PageContainer>
  )
}
