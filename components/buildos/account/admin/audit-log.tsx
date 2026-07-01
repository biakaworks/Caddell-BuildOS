"use client"

import { useMemo, useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  AUDIT_CATEGORY_META,
  AUDIT_EVENTS,
  type AuditCategory,
} from "@/lib/account-data"
import { cn } from "@/lib/utils"

const TONE_CLASSES: Record<string, string> = {
  neutral: "bg-muted text-muted-foreground",
  info: "bg-info-muted text-info-strong",
  warning: "bg-warning-muted text-warning-strong",
  danger: "bg-danger-muted text-danger-strong",
  success: "bg-success-muted text-success-strong",
}

const FILTERS: { key: AuditCategory | "all"; label: string }[] = [
  { key: "all", label: "All events" },
  { key: "sign-in", label: "Sign-in" },
  { key: "permission", label: "Permission" },
  { key: "sensitive-access", label: "Sensitive access" },
  { key: "admin-action", label: "Admin action" },
  { key: "isolation", label: "Isolation" },
]

export function AuditLog() {
  const [filter, setFilter] = useState<AuditCategory | "all">("all")
  const [query, setQuery] = useState("")

  const events = useMemo(() => {
    const q = query.trim().toLowerCase()
    return AUDIT_EVENTS.filter((e) => {
      if (filter !== "all" && e.category !== filter) return false
      if (!q) return true
      return (
        e.actor.toLowerCase().includes(q) ||
        e.action.toLowerCase().includes(q) ||
        e.target.toLowerCase().includes(q)
      )
    })
  }, [filter, query])

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search actor, action, or target"
            className="pl-9"
            aria-label="Search audit events"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                filter === f.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/70",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {events.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm text-muted-foreground">
            No events match your filters.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {events.map((e) => {
              const meta = AUDIT_CATEGORY_META[e.category]
              return (
                <li key={e.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[11px] font-medium",
                          TONE_CLASSES[meta.tone],
                        )}
                      >
                        {meta.label}
                      </span>
                      <span className="font-medium text-card-foreground">{e.actor}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground text-pretty">
                      {e.action} · <span className="text-foreground/70">{e.target}</span>
                    </p>
                  </div>
                  <div className="shrink-0 text-left text-xs text-muted-foreground sm:text-right">
                    <div className="tabular-nums">{e.timestamp}</div>
                    <div className="tabular-nums">{e.ip}</div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Showing {events.length} of {AUDIT_EVENTS.length} recent events. Full audit history is
        retained for 7 years and exportable on request.
      </p>
    </div>
  )
}
