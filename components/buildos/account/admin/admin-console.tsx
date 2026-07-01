"use client"

import { useState } from "react"
import Link from "next/link"
import { ShieldCheck, ShieldX } from "lucide-react"
import { PageContainer, PageHeader } from "@/components/buildos/ui"
import { useAuth } from "@/components/buildos/account/auth-context"
import { cn } from "@/lib/utils"
import { AdminOverview } from "./admin-overview"
import { UserManagement } from "./user-management"
import { RolesMatrix } from "./roles-matrix"
import { AccessIsolation } from "./access-isolation"
import { AuditLog } from "./audit-log"

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "users", label: "User management" },
  { key: "roles", label: "Roles & permissions" },
  { key: "access", label: "Access & isolation" },
  { key: "audit", label: "Audit log" },
] as const

type TabKey = (typeof TABS)[number]["key"]

export function AdminConsole() {
  const { currentUser } = useAuth()
  const [tab, setTab] = useState<TabKey>("overview")

  // Role gate — non-admins get a clear, self-contained access-denied state
  // instead of a dead end.
  if (currentUser.role !== "Admin") {
    return (
      <PageContainer>
        <div className="mx-auto max-w-md rounded-xl border border-border bg-card p-8 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-danger-muted text-danger-strong">
            <ShieldX className="size-6" />
          </span>
          <h1 className="mt-4 font-heading text-xl font-semibold text-card-foreground">
            Administrator access required
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
            The admin console is restricted to users with the Administrator role. You are currently
            signed in as <span className="font-medium text-foreground">{currentUser.role}</span>.
            Switch to the Admin demo role using the role selector in the top bar, or contact your IT
            administrator to request elevated access.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Return to dashboard
          </Link>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <PageHeader
        title="Admin console"
        subtitle="Manage users, roles, access isolation, and security auditing for your Caddell BuildOS tenant."
      >
        <span className="inline-flex items-center gap-1.5 rounded-full bg-info-muted px-3 py-1 text-xs font-medium text-info-strong">
          <ShieldCheck className="size-3.5" /> Administrator
        </span>
      </PageHeader>

      <div className="mt-6 overflow-x-auto">
        <div
          role="tablist"
          aria-label="Admin sections"
          className="flex min-w-max gap-1 border-b border-border"
        >
          {TABS.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "relative -mb-px whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors",
                tab === t.key
                  ? "border-b-2 border-primary text-foreground"
                  : "border-b-2 border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        {tab === "overview" && <AdminOverview onNavigate={(t) => setTab(t as TabKey)} />}
        {tab === "users" && <UserManagement />}
        {tab === "roles" && <RolesMatrix />}
        {tab === "access" && <AccessIsolation />}
        {tab === "audit" && <AuditLog />}
      </div>
    </PageContainer>
  )
}
