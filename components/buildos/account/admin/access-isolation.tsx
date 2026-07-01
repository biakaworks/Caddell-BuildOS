"use client"

import { ShieldAlert } from "lucide-react"
import { ACCESS_SCOPES, ROLE_META } from "@/lib/account-data"

export function AccessIsolation() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-info/30 bg-info-muted/40 p-4">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5 size-5 shrink-0 text-info-strong" />
          <div>
            <h3 className="font-heading text-sm font-semibold text-foreground">
              Tenant isolation model
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground text-pretty">
              Access is scoped by role, business unit, and project. Cross-boundary access is denied
              by default and every exception is recorded as a security event. Trade Partners are
              hard-isolated to the specific projects they are assigned.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {ACCESS_SCOPES.map((scope) => (
          <div key={scope.role} className="flex flex-col rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="font-heading text-base font-semibold text-card-foreground">
                {scope.role}
              </span>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
                {ROLE_META[scope.role].label}
              </span>
            </div>

            <dl className="mt-4 space-y-3 text-sm">
              <ScopeRow label="Tenant" value={scope.tenant} />
              <ScopeRow label="Business units" value={scope.businessUnits} />
              <ScopeRow label="Projects" value={scope.projects} />
              <ScopeRow label="Cross-boundary" value={scope.crossBoundary} />
              <ScopeRow label="Data residency" value={scope.dataResidency} />
            </dl>
          </div>
        ))}
      </div>
    </div>
  )
}

function ScopeRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-border pb-3 last:border-0 last:pb-0">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="text-card-foreground text-pretty">{value}</dd>
    </div>
  )
}
