"use client"

import { Users, UserPlus, ShieldCheck, ShieldAlert } from "lucide-react"
import { useAuth } from "@/components/buildos/account/auth-context"
import { AUDIT_EVENTS, AUDIT_CATEGORY_META } from "@/lib/account-data"
import { cn } from "@/lib/utils"

const TONE_CLASSES: Record<string, string> = {
  neutral: "bg-muted text-muted-foreground",
  info: "bg-info-muted text-info-strong",
  warning: "bg-warning-muted text-warning-strong",
  danger: "bg-danger-muted text-danger-strong",
  success: "bg-success-muted text-success-strong",
}

export function AdminOverview({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const { users } = useAuth()

  const total = users.length
  const active = users.filter((u) => u.status === "active").length
  const invited = users.filter((u) => u.status === "invited").length
  const suspended = users.filter((u) => u.status === "suspended").length
  const admins = users.filter((u) => u.role === "Admin").length

  const stats = [
    { label: "Total users", value: total, icon: Users, tone: "info" as const },
    { label: "Active", value: active, icon: ShieldCheck, tone: "success" as const },
    { label: "Pending invites", value: invited, icon: UserPlus, tone: "warning" as const },
    { label: "Administrators", value: admins, icon: ShieldAlert, tone: "neutral" as const },
  ]

  const recent = AUDIT_EVENTS.slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <span
                className={cn(
                  "grid size-8 place-items-center rounded-lg",
                  TONE_CLASSES[s.tone],
                )}
              >
                <s.icon className="size-4" />
              </span>
            </div>
            <div className="mt-2 font-heading text-3xl font-semibold tabular-nums text-card-foreground">
              {s.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-heading text-sm font-semibold text-card-foreground">
              Recent security activity
            </h2>
            <button
              onClick={() => onNavigate?.("audit")}
              className="text-xs font-medium text-primary hover:underline"
            >
              View full log
            </button>
          </div>
          <ul className="divide-y divide-border">
            {recent.map((e) => {
              const meta = AUDIT_CATEGORY_META[e.category]
              return (
                <li key={e.id} className="flex items-center gap-3 px-5 py-3">
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium",
                      TONE_CLASSES[meta.tone],
                    )}
                  >
                    {meta.label}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-card-foreground">
                      <span className="font-medium">{e.actor}</span> — {e.action}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                    {e.timestamp.split(" ")[1]}
                  </span>
                </li>
              )
            })}
          </ul>
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-heading text-sm font-semibold text-card-foreground">
            Account health
          </h2>
          <dl className="mt-4 space-y-3 text-sm">
            <HealthRow label="Active accounts" value={active} total={total} tone="success" />
            <HealthRow label="Pending invitations" value={invited} total={total} tone="warning" />
            <HealthRow label="Suspended" value={suspended} total={total} tone="danger" />
          </dl>
          <button
            onClick={() => onNavigate?.("users")}
            className="mt-5 w-full rounded-lg bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/70"
          >
            Manage users
          </button>
        </section>
      </div>
    </div>
  )
}

function HealthRow({
  label,
  value,
  total,
  tone,
}: {
  label: string
  value: number
  total: number
  tone: "success" | "warning" | "danger"
}) {
  const pct = total ? Math.round((value / total) * 100) : 0
  const barTone = {
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
  }[tone]
  return (
    <div>
      <div className="flex items-center justify-between">
        <dt className="text-muted-foreground">{label}</dt>
        <dd className="font-medium tabular-nums text-card-foreground">
          {value} <span className="text-muted-foreground">({pct}%)</span>
        </dd>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full", barTone)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
