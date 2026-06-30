"use client"

import { useState } from "react"
import {
  Plug,
  Database,
  CalendarRange,
  FolderOpen,
  Box,
  HardHat,
  Check,
  RefreshCw,
  Plus,
} from "lucide-react"
import {
  INTEGRATIONS,
  type Integration,
  type IntegrationStatus,
  type IntegrationCategory,
} from "@/lib/mock-data"
import { PageContainer, PageHeader } from "@/components/buildos/ui"
import { PhaseBadge } from "@/components/buildos/phase"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const categoryIcon: Record<IntegrationCategory, typeof Database> = {
  "ERP & Accounting": Database,
  Scheduling: CalendarRange,
  "Document Management": FolderOpen,
  "BIM & Design": Box,
  "Field & Safety": HardHat,
}

const CATEGORIES: IntegrationCategory[] = [
  "ERP & Accounting",
  "Scheduling",
  "Document Management",
  "BIM & Design",
  "Field & Safety",
]

function StatusChip({ status }: { status: IntegrationStatus }) {
  if (status === "Connected") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-success-muted px-2.5 py-1 text-xs font-medium text-success-strong">
        <Check className="size-3.5" />
        Connected
      </span>
    )
  }
  if (status === "Syncing") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-info-muted px-2.5 py-1 text-xs font-medium text-info">
        <RefreshCw className="size-3.5 motion-safe:animate-spin [animation-duration:2.5s]" />
        Syncing
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
      Available
    </span>
  )
}

export function IntegrationsView() {
  const connected = INTEGRATIONS.filter((i) => i.status === "Connected").length
  const syncing = INTEGRATIONS.filter((i) => i.status === "Syncing").length

  return (
    <PageContainer>
      <PageHeader
        title={
          <span className="flex items-center gap-2.5">
            Integrations
            <PhaseBadge phase={2} />
          </span>
        }
        subtitle="Augment Caddell's existing toolchain — connect ERP, scheduling, documents, and BIM. BuildOS reads from the systems teams already trust."
      />

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryTile label="Connected" value={String(connected)} tone="success" />
        <SummaryTile label="Syncing" value={String(syncing)} tone="info" />
        <SummaryTile label="Available" value={String(INTEGRATIONS.length - connected - syncing)} tone="neutral" />
        <SummaryTile label="Categories" value={String(CATEGORIES.length)} tone="neutral" />
      </div>

      <div className="mt-8 space-y-8">
        {CATEGORIES.map((category) => {
          const items = INTEGRATIONS.filter((i) => i.category === category)
          if (items.length === 0) return null
          const Icon = categoryIcon[category]
          return (
            <section key={category}>
              <div className="mb-3 flex items-center gap-2">
                <Icon className="size-4 text-primary" />
                <h2 className="font-heading text-sm font-semibold tracking-tight text-foreground">
                  {category}
                </h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((integration) => (
                  <IntegrationCard key={integration.id} integration={integration} />
                ))}
              </div>
            </section>
          )
        })}
      </div>

      <div className="mt-8 flex items-center gap-3 rounded-xl border border-dashed border-border bg-card/50 px-4 py-3 text-sm text-muted-foreground">
        <Plug className="size-4" />
        Don&apos;t see a system? Request a connector and our team will scope it for your toolchain.
      </div>
    </PageContainer>
  )
}

function IntegrationCard({ integration }: { integration: Integration }) {
  const isConnected = integration.status === "Connected" || integration.status === "Syncing"
  const [requested, setRequested] = useState(false)
  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground text-pretty">{integration.name}</h3>
        <StatusChip status={integration.status} />
      </div>
      <p className="mt-2 flex-1 text-xs leading-relaxed text-muted-foreground">{integration.description}</p>

      {isConnected ? (
        <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
          <span>{integration.records}</span>
          <span>{integration.lastSync}</span>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="mt-3 w-full gap-1.5"
          disabled={requested}
          onClick={() => setRequested(true)}
        >
          {requested ? <Check className="size-3.5" /> : <Plus className="size-3.5" />}
          {requested ? "Connection requested" : "Connect"}
        </Button>
      )}
    </div>
  )
}

function SummaryTile({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: "success" | "info" | "neutral"
}) {
  const valueClass =
    tone === "success" ? "text-success-strong" : tone === "info" ? "text-info" : "text-foreground"
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className={cn("font-heading text-2xl font-semibold tracking-tight tabular-nums", valueClass)}>
        {value}
      </p>
      <p className="mt-0.5 text-xs font-medium text-muted-foreground">{label}</p>
    </div>
  )
}
