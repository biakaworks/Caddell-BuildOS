"use client"

import { ShieldCheck } from "lucide-react"
import {
  CAPABILITIES,
  CAPABILITY_META,
  PERMISSION_MATRIX,
  ROLES,
  ROLE_META,
  type CapabilityLevel,
} from "@/lib/account-data"
import { cn } from "@/lib/utils"

const LEVEL_CLASSES: Record<CapabilityLevel, string> = {
  none: "bg-muted text-muted-foreground/60",
  view: "bg-info-muted text-info-strong",
  create: "bg-info-muted text-info-strong",
  edit: "bg-success-muted text-success-strong",
  admin: "bg-warning-muted text-warning-strong",
}

export function RolesMatrix() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {ROLES.map((role) => {
          const grants = Object.values(PERMISSION_MATRIX[role]).filter((l) => l !== "none").length
          return (
            <div key={role} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2">
                <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                  <ShieldCheck className="size-4" />
                </span>
                <span className="font-heading text-sm font-semibold text-card-foreground">
                  {role}
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground text-pretty">
                {ROLE_META[role].blurb}
              </p>
              <div className="mt-3 text-xs font-medium text-muted-foreground">
                Access to {grants} of {CAPABILITIES.length} areas
              </div>
            </div>
          )
        })}
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="sticky left-0 z-10 bg-muted/40 px-4 py-3 text-left font-medium text-muted-foreground">
                  Capability
                </th>
                {ROLES.map((role) => (
                  <th key={role} className="px-4 py-3 text-center font-medium text-muted-foreground">
                    {role}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CAPABILITIES.map((cap) => (
                <tr key={cap.id} className="border-b border-border last:border-0">
                  <td className="sticky left-0 z-10 bg-card px-4 py-3">
                    <div className="flex items-center gap-1.5 font-medium text-card-foreground">
                      {cap.label}
                      {cap.sensitive && (
                        <span className="rounded-full bg-warning-muted px-1.5 py-0.5 text-[10px] font-medium text-warning-strong">
                          Sensitive
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground text-pretty">{cap.description}</div>
                  </td>
                  {ROLES.map((role) => {
                    const level = PERMISSION_MATRIX[role][cap.id] ?? "none"
                    return (
                      <td key={role} className="px-4 py-3 text-center">
                        <span
                          className={cn(
                            "inline-flex min-w-16 justify-center rounded-full px-2.5 py-1 text-xs font-medium",
                            LEVEL_CLASSES[level],
                          )}
                        >
                          {CAPABILITY_META[level].short}
                        </span>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Permission sets follow least-privilege defaults and are enforced by your identity provider.
        To request a change to a role definition, contact your Caddell IT administrator.
      </p>
    </div>
  )
}
